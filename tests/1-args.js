var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    args = require('../lib/args');

var argsTests = {
    '--help': 'help',
    '-h': 'help',
    '--version': 'version',
    '-v': 'version',
    '--strict': 'strict',
    '--cache': 'cache',
    '--walk': 'walk',
    '--recursive': 'recursive',
    '--watch': 'watch',
    '--quiet': 'quiet',
    '--ant': 'ant',
    '--fail': 'fail',
    '--jsstamp': 'jsstamp',
    '--compressor': 'compressor',
    '--list': 'list',
    '--exec': 'exec',
    '--semi': 'semi',
    '--istanbul': 'istanbul',
    '--progress': 'progress',
    '--assets': 'assets',
    '--csslint': 'csslint',
    '--coverage': 'coverage',
    '--clean': 'clean',
    '--lint-stderr': 'lint-stderr',
    '-w': 'walk'
};

var tests = {
    'should be loaded': {
        topic: function () {
            return args
        },
        'should have parse method': function (topic) {
            assert.isFunction(topic.parse);
        },
        'should have shorts object': function (topic) {
            assert.isObject(topic.shorts);
        },
        'should have known object': function (topic) {
            assert.isObject(topic.known);
        }
    },
    'should parse --config <file>': {
        topic: function() {
            return args.parse(['', '', '--config', '']);
        },
        'should not parse no file': function(topic) {
            assert.equal(topic.config, process.cwd());
        }
    },
    'should had cache as false by default': {
        topic: function() {
            return args.parse(['', '']);
        },
        'cache should be false': function(topic) {
            assert.equal(topic.cache, false);
        }
    },
    'should parse --no-csslint': {
        topic: function() {
            return args.parse(['', '', '--no-csslint']);
        },
        'csslint should be false': function(topic) {
            assert.isFalse(topic.csslint);
        }
    },
    'should parse --no-lint': {
        topic: function() {
            return args.parse(['', '', '--no-lint']);
        },
        'lint should be false': function(topic) {
            assert.isFalse(topic.lint);
        }
    },
    'should parse --no-cache': {
        topic: function() {
            return args.parse(['', '', '--no-cache']);
        },
        'cache should be false': function(topic) {
            assert.equal(topic.cache, false);
        }
    },
    'should parse --no-progress': {
        topic: function() {
            return args.parse(['', '', '--no-progress']);
        },
        'progress should be false': function(topic) {
            assert.isFalse(topic.progress);
        }
    },
    'should parse --no-istanbul': {
        topic: function() {
            return args.parse(['', '', '--no-istanbul']);
        },
        'istanbul should be false': function(topic) {
            assert.isFalse(topic.istanbul);
        }
    },
    'should parse --no-semi': {
        topic: function() {
            return args.parse(['', '', '--no-semi']);
        },
        'semi should be false': function(topic) {
            assert.isFalse(topic.semi);
        }
    },
    'should parse --no-assets': {
        topic: function() {
            return args.parse(['', '', '--no-assets']);
        },
        'assets should be false': function(topic) {
            assert.isFalse(topic.assets);
        }
    },
    'should not parse --no-fail': {
        topic: function() {
            return args.parse(['', '', '--no-fail']);
        },
        'should parse': function(topic) {
            assert.equal(topic.fail, false);
        }
    },
    'fail should be undefined by default': {
        topic: function() {
            return args.parse(['', '']);
        },
        'should parse': function(topic) {
            assert.equal(topic.fail, undefined);
        }
    },
    'should parse --fail': {
        topic: function() {
            return args.parse(['', '', '--fail']);
        },
        'should parse': function(topic) {
            assert.equal(topic.fail, true);
        }
    },
    'should parse -m foo': {
        topic: function() {
            return args.parse(['', '', '-m', 'foo']);
        },
        'should parse defaults': function(topic) {
            assert.ok(topic.modules);
            assert.isArray(topic.modules);
            assert.equal(topic.modules.length, 1);
            assert.equal(topic.modules[0], 'foo');
        }
    },
    'should parse -m foo -m bar': {
        topic: function() {
            return args.parse(['', '', '-m', 'foo', '-m', 'bar']);
        },
        'should parse defaults': function(topic) {
            assert.ok(topic.modules);
            assert.isArray(topic.modules);
            assert.equal(topic.modules.length, 2);
            assert.equal(topic.modules[0], 'foo');
            assert.equal(topic.modules[1], 'bar');
        }
    },
    'should default to jsstamp true': {
        topic: function() {
            return args.parse(['', '', '']);
        },
        'parsed as true': function(topic) {
            assert.isTrue(topic.jsstamp);
        }
    },
    'should parse --no-jsstamp': {
        topic: function() {
            return args.parse(['', '', '--no-jsstamp']);
        },
        'parsed as false': function(topic) {
            assert.isFalse(topic.jsstamp);
        }
    },
    'should parse --no-exec': {
        topic: function() {
            return args.parse(['', '', '--no-exec']);
        },
        'parsed as false': function(topic) {
            assert.isFalse(topic.exec);
        }
    },
    'should parse --no-coverage': {
        topic: function() {
            return args.parse(['', '', '--no-coverage']);
        },
        'parsed as false': function(topic) {
            assert.isFalse(topic.coverage);
        }
    },
    'should have coverage by default': {
        topic: function() {
            return args.parse(['', '']);
        },
        'parsed as true': function(topic) {
            assert.isTrue(topic.coverage);
        }
    },
    'should have exec by default': {
        topic: function() {
            return args.parse(['', '']);
        },
        'parsed as true': function(topic) {
            assert.isTrue(topic.exec);
        }
    },
    'should have lint-stderr false by default': {
        topic: function() {
            return args.parse(['', '']);
        },
        'parsed as false': function(topic) {
            assert.isFalse(topic['lint-stderr']);
        }
    },
    'should parse --build-dir': {
        topic: function() {
            return args.parse(['', '', '--build-dir', '/test']);
        },
        'should be "/test"': function(topic) {
            assert.equal('/test', topic['build-dir']);
        }
    },
    'should set default build-dir to "../../build"': {
        topic: function() {
            return args.parse(['', '']);
        },
        'should be "../../build"': function(topic) {
            assert.equal(topic['build-dir'], '../../build');
        }
    },
    'args.has(foo) (not an argument)': {
        topic: function() {
            return args.has('foo')
        },
        'should return false': function (topic) {
            assert.isFalse(topic);
        }
    },
    'args.has(spec) (vows argument)': {
        topic: function() {
            return args.has('spec')
        },
        'should return true': function (topic) {
            assert.isTrue(topic);
        }
    },
    'args.defaults() should process raw args': {
        topic: function() {
            return args.defaults();
        },
        'should do something': function(topic) {
            assert.ok(topic.jsstamp);
            assert.ok(topic.coverage);
            assert.ok(topic.exec);
            assert.isFalse(topic.quiet);
            assert.isFalse(topic.cache);
        }
    },
    'args.baseOptions should define all of the standard options': {
        topic: function() {
            return args.baseOptions();
        },
        'should default undefined': function(topic) {
            assert.isTrue(topic.hasOwnProperty('walk') && topic.walk === undefined);
            assert.isTrue(topic.hasOwnProperty('cache') && topic.cache === undefined);
            assert.isTrue(topic.hasOwnProperty('lint') && topic.lint === undefined);
        },
        'should not have undefined values': function(topic) {
            assert.isFalse(topic.hasOwnProperty('foo'));
            assert.isFalse(topic.hasOwnProperty('bar'));
            assert.isFalse(topic.hasOwnProperty('baz'));
        }
    },
    'args.baseOptions should allow CLI overrides of options': {
        topic: function() {
            return args.baseOptions({
                cache: true,
                lint: 'config'
            });
        },
        'should allow overrides': function(topic) {
            assert.isTrue(topic.cache);
            assert.equal('config', topic.lint);
        },
        'should default undefined': function(topic) {
            assert.isTrue(topic.hasOwnProperty('walk') && topic.walk === undefined);
        },
        'should not have undefined values': function(topic) {
            assert.isFalse(topic.hasOwnProperty('foo'));
            assert.isFalse(topic.hasOwnProperty('bar'));
            assert.isFalse(topic.hasOwnProperty('baz'));
        }
    }
};

for (var i in argsTests) {
    (function(arg) {
        tests['should parse ' + arg] = {
            topic: function() {
                return args.parse(['', '', arg]);
            },
            'should parse': function(topic) {
                assert.isTrue(topic[argsTests[arg]]);
            }
        };
    }(i));
}

vows.describe('args').addBatch(tests).export(module);
