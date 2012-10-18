var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    timer = require('../lib/timer'),
    pack = require('../lib/pack'),
    shifter = require('../lib/'),
    util = require('../lib/util');

var tests = {
    'util should be loaded': {
        topic: function () {
            return util
        },
        'should have find method': function (topic) {
            assert.isFunction(topic.find);
        }
    },
    'should find ../.travis.yml': {
        topic: function() {
            util.find(__dirname, '.travis.yml', this.callback);
        },
        'should find the file': function(topic) {
            var expected = path.join(__dirname, '../', '.travis.yml');
            assert.equal(topic, expected);
        }
    },
    'should not find NOFILE.txt': {
        topic: function() {
            var self = this;
            util.find(__dirname, 'NOFILE.txt', function(err, file) {
                self.callback(null, {
                    err: err,
                    file: file
                });
            });
        },
        'should throw an error': function(topic) {
            assert.equal(topic.err, 'not found');
        },
        'should have null file': function(topic) {
            assert.isNull(topic.file);
        }
    },
    //No way to simulate this without hourly tests
    'timer should work with hours': {
        topic: function() {
            var start = new Date('1/1/2010 3:00:00'),
                end = new Date('1/1/2110 5:43:21');
            return timer.calc(start.getTime(), end.getTime());
        },
        'should print': function(topic) {
            assert.equal(topic, '2 hours, 43 minutes, 21 seconds');
        }
    },
    //No way to simulate this without tests taking forever
    'timer should work with minutes': {
        topic: function() {
            var start = new Date('1/1/2010 3:00:00'),
                end = new Date('1/1/2110 3:21:01');
            return timer.calc(start.getTime(), end.getTime());
        },
        'should print': function(topic) {
            assert.equal(topic, '21 minutes, 1 seconds');
        }
    },
    'munging the pack, with a shifter config': {
        topic: function() {
            var self = this,
                cwd = path.join(__dirname, 'assets/yql/src/yql');

            shifter.cwd = function() {
                return cwd;
            };
            pack.munge({
                "name": "yql",
                "builds": {
                    "yql": {
                        "jsfiles": [
                            "yql.js"
                        ]
                    }
                },
                "rollups": {
                    "yql": {
                        files: []
                    },
                    "foo": {
                        files: []
                    }
                },
                "shifter": {
                    spec: true,
                    foo: true
                }
            }, {}, function(json, opts) {
                self.callback(null, {
                    json: json,
                    options: opts
                });
            });
        },
        "should have munged data in options": function(topic) {
            assert.isTrue(topic.options.foo);
            assert.isUndefined(topic.options.spec);
        },
        "json should have loader meta": function(topic) {
            assert.ok(topic.json.builds.yql.config);
        }
    },
    'should stamp js files with strict': {
        topic: function() {
            var self = this,
                jsstamp = require('../lib/tasks/jsstamp').jsstamp;

            jsstamp({
                strict: true
            }, {
                result: '',
                constructor: function(result) {
                    this.result = result;
                    this.get = function() {
                        return this.result;
                    }
                }
            }, function(err, blob) {
                self.callback(null, blob);
            });
        },
        'done': function(topic) {
            assert.ok(topic.get());
            assert.equal(topic.get(), ' "use strict";\n');
        }
    },
    'should throw on uglify error in callback': {
        topic: function() {
            var self = this,
                jsminify = require('../lib/tasks/jsminify').jsminify;

            jsminify({
                callback: function(err) {
                    self.callback(null, err);
                }
            }, {
                result: 'var foo + bar = "";',
                constructor: function(result) {
                }
            }, function(err, blob) {
                //self.callback(null, blob);
            });
        },
        'should have proper error message': function(topic) {
            assert.ok(topic);
            assert.equal(topic.message, 'Unexpected token: operator (+)');
        }
    },
    'should throw on uglify error without a callback': {
        topic: function() {
            var self = this,
                jsminify = require('../lib/tasks/jsminify').jsminify;

            jsminify({
            }, {
                result: 'var foo + bar = "";',
                constructor: function(result) {
                }
            }, function(err, blob) {
                self.callback(null, err);
            });
        },
        'should have proper error message': function(topic) {
            assert.ok(topic);
            assert.equal(topic, 'Minify failed, file unparseable');
        }
    },
    'md5check should skip on no file': {
        topic: function() {
            var self = this,
                md5check = require('../lib/tasks/md5').md5check;

            md5check({
                current: path.join(__dirname, 'foobar.js')
            }, {
                result: '',
                constructor: function(result) {
                }
            }, function(err, blob) {
                self.callback(null, err);
            });
        },
        'should have proper error message': function(topic) {
            assert.isNull(topic);
        }
    },
    'md5check should not err': {
        topic: function() {
            var self = this,
                md5check = require('../lib/tasks/md5').md5check;

            md5check({
                error: true,
                current: __filename
            }, {
                result: 'This is some random shit..',
                constructor: function(result) {
                }
            }, function(err, blob) {
                self.callback(null, err);
            });
        },
        'should have proper error message': function(topic) {
            assert.isNull(topic);
        }
    },
    'general logging': {
        topic: function() {
            return require('../lib/log')
        },
        'should have and use warn': function(topic) {
            assert.ok(topic.warn);
            topic.warn('test warning');
        },
        'should have and use log.console.log and log.console.error': function(topic) {
            assert.ok(topic.console);
            assert.ok(topic.console.log);
            assert.ok(topic.console.error);
            topic.console.log('test console.log');
            topic.console.error('test console.error');
            topic.silent();
            topic.console.log('test console.log');
            topic.console.error('test console.error');
            topic.reset();
            topic.quiet();
            topic.console.log('test console.log');
            topic.console.error('test console.error');
        },
        'testing log.error': function(topic) {
            var exit = process.exit,
                status;
            process.exit = function(code) {
                status = code;
            };

            topic.error('foobar');
            assert.equal(status, 1);
            status = null;
            topic.reset();
            topic.silent();
            topic.error('foobar');
            assert.equal(status, 1);

            process.exit = exit;
        }
    }
};

vows.describe('general').addBatch(tests).export(module);
