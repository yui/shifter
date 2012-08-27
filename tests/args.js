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
    '--watch': 'watch',
    '--quiet': 'quiet',
    '--ant': 'ant',
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
    'should parse --cache-file <file>': {
        topic: function() {
            return args.parse(['', '', '--cache-file', '../.shifter_meta']);
        },
        'should parse new file': function(topic) {
            assert.equal(topic['cache-file'], path.join(process.cwd(), '../.shifter_meta'));
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
    'should parse --no-cache': {
        topic: function() {
            return args.parse(['', '', '--no-cache']);
        },
        'cache should be false': function(topic) {
            assert.equal(topic.cache, false);
        }
    },
    'should parse --lint defaults': {
        topic: function() {
            return args.parse(['', '', '--lint', 'defaults']);
        },
        'should parse defaults': function(topic) {
            assert.equal(topic.lint, 'defaults');
        }
    },
    'should parse --lint preferred': {
        topic: function() {
            return args.parse(['', '', '--lint', 'preferred']);
        },
        'should parse defaults': function(topic) {
            assert.equal(topic.lint, 'preferred');
        }
    },
    'should parse --lint strict': {
        topic: function() {
            return args.parse(['', '', '--lint', 'strict']);
        },
        'should parse defaults': function(topic) {
            assert.equal(topic.lint, 'strict');
        }
    },
    'should parse --lint foobar as preferred': {
        topic: function() {
            return args.parse(['', '', '--lint', 'foobar']);
        },
        'should parse defaults': function(topic) {
            assert.equal(topic.lint, 'preferred');
        }
    },
    'should parse no --lint as preferred': {
        topic: function() {
            return args.parse(['', '']);
        },
        'should parse defaults': function(topic) {
            assert.equal(topic.lint, 'preferred');
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
