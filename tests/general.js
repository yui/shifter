var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    pack = require('../lib/pack'),
    shifter = require('../lib/'),
    Stack = require('../lib/stack').Stack,
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
            }, {}, function(err, json, opts) {
                self.callback(err, {
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
        },
        'munging the pack, with a BAD shifter config': {
            topic: function() {
                var self = this,
                    cwd = path.join(__dirname, 'assets/badmeta');

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
                }, {}, function(err, json, opts) {
                    self.callback(null, err);
                });
            },
            "should callback with an error": function(topic) {
                assert.ok(topic);
                assert.equal(topic, 'hitting the brakes! failed to parse bad.json, syntax error?');
            }
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
    'md5check should skip on directory': {
        topic: function() {
            var self = this,
                md5check = require('../lib/tasks/md5').md5check;

            md5check({
                current: path.join(__dirname)
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
    'md5check should err on matching sums': {
        topic: function() {
            var self = this,
                md5check = require('../lib/tasks/md5').md5check;

            md5check({
                error: true,
                current: path.join(__dirname, 'assets/prepend.txt')
            }, {
                result: 'PREPEND',
                constructor: function(result) {
                }
            }, function(err, blob) {
                self.callback(null, err);
            });
        },
        'should have proper error message': function(topic) {
            assert.ok(topic);
            assert.equal(topic, 'file has not changed, bailing the build');
        }
    },
    'md5check should not err on matching sums if error: false': {
        topic: function() {
            var self = this,
                md5check = require('../lib/tasks/md5').md5check;

            md5check({
                error: false,
                current: path.join(__dirname, 'assets/prepend.txt')
            }, {
                result: 'PREPEND',
                constructor: function(result) {
                }
            }, function(err, blob) {
                self.callback(null, err);
            });
        },
        'should have null error': function(topic) {
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
        }
    },
    'general tasks': {
        'tasks/check': {
            topic: function() {
                return require('../lib/tasks/check').check;
            },
            'should be a function': function(topic) {
                assert.isFunction(topic);
            },
            'and should produce an error on empty results': function(topic) {
                topic({}, {
                    result: '',
                    name: 'foo.txt'
                }, function(err) {
                    assert.equal(err, 'writing zero length file from foo.txt');
                });
            }
        },
        'tasks/wrap': {
            topic: function() {
                return require('../lib/tasks/wrap').wrap;
            },
            'should be a function': function(topic) {
                assert.isFunction(topic);
            },
            'and should work with no options': function(topic) {
                topic(null, {
                    result: 'foobar',
                    constructor: function(result) {
                        this.get = function() {
                            return result;
                        }
                    }
                }, function(err, blob) {
                    assert.equal(blob.get(), 'foobar');
                });
            },
            'should append a file': {
                topic: function() {
                    var wrap =  require('../lib/tasks/wrap').wrap;
                    wrap({
                        append: path.join(__dirname, 'assets', 'append.txt')
                    }, {
                        result: 'foobar',
                        constructor: function(result) {
                            this.get = function() {
                                return result;
                            }
                        }
                    }, this.callback);
                },
                'should have the data': function(topic) {
                    assert.equal(topic.get(), 'foobarAPPEND\n');
                }
            },
            'should prepend a file': {
                topic: function() {
                    var wrap =  require('../lib/tasks/wrap').wrap;
                    wrap({
                        prepend: [
                            './does/not/exist',
                            path.join(__dirname, 'assets', 'prepend.txt')
                        ]
                    }, {
                        result: 'foobar',
                        constructor: function(result) {
                            this.get = function() {
                                return result;
                            }
                        }
                    }, this.callback);
                },
                'should have the data': function(topic) {
                    assert.equal(topic.get(), '\nPREPEND\nfoobar');
                }
            }
        },
        'tasks/cssstamp': {
            topic: function() {
                return require('../lib/tasks/cssstamp').cssstamp;
            },
            'should be a function': function(topic) {
                assert.isFunction(topic);
            },
            'and should return expected with no options': function(topic) {
                topic(null, {
                    result: 'foobar',
                    constructor: function(result) {
                        this.get = function() {
                            return result;
                        }
                    }
                }, function(err, blob) {
                    assert.equal(blob.get(), 'foobar\n\n');
                });
            },
            'and should return expected with options': function(topic) {
                topic({
                    stamp: 'baz'
                }, {
                    result: 'foobar',
                    constructor: function(result) {
                        this.get = function() {
                            return result;
                        }
                    }
                }, function(err, blob) {
                    assert.equal(blob.get(), 'foobar\nbaz\n');
                });
            }
        },
        'tasks/jshint': {
            topic: function() {
                return require('../lib/tasks/jshint').jshint;
            },
            'should be a function': function(topic) {
                assert.isFunction(topic);
            },
            'and should return expected with no options': function(topic) {
                topic(null, {
                    result: 'var foo = "bar";',
                    constructor: function(blob, opts) {
                        this.get = function() {
                            return opts;
                        }
                    }
                }, function(err, blob) {
                    assert.equal(blob.result, 'var foo = "bar";');
                });
            }
        },
        'tasks/coverage': {
            topic: function() {
                return require('../lib/tasks/coverage').coverage;
            },
            'should be a function': function(topic) {
                assert.isFunction(topic);
            },
            'and should return expected (istanbul) with no options': function(topic) {
                topic(null, {
                    result: 'var foo = "bar";',
                    constructor: function(data) {
                        this.get = function() {
                            return data;
                        }
                    }
                }, function(err, blob) {
                    assert.ok(blob.get().indexOf('__coverage__') !== -1);
                });
            },
            'and should return error (istanbul) with no options': function(topic) {
                topic(null, {
                    result: 'var foo + "bar";',
                    constructor: function(data) {
                        this.get = function() {
                            return data;
                        }
                    }
                }, function(err, blob) {
                    assert.equal(err.message, 'Line 1: Unexpected token +');
                });
            },
            'should use yuitest': {
                topic: function() {
                    var cover = require('../lib/tasks/coverage').coverage;
                    
                    cover({
                        type: 'yuitest'
                    }, {
                        result: 'var foo = "bar";',
                        constructor: function(data) {
                            this.get = function() {
                                return data;
                            }
                        }
                    }, this.callback);
                },
                'and should return expected (yuitest)': function(topic) {
                    assert.ok(topic.get().indexOf('_yuitest_coverage') !== -1);
                }
            },
            'should use yuitest and produce error': {
                topic: function() {
                    var cover = require('../lib/tasks/coverage').coverage,
                        self = this;
                    cover({
                        type: 'yuitest'
                    }, {
                        result: 'var foo + "bar";',
                        constructor: function(data) {
                            this.get = function() {
                                return data;
                            }
                        }
                    }, function(err) {
                        self.callback(null, err);
                    });
                },
                'and should return error (yuitest)': function(topic) {
                    assert.equal(topic, "line 1:8 no viable alternative at input '+'\n");
                }
            }
        },
        'tasks/jsstamp': {
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
            'use strict was applied': function(topic) {
                assert.ok(topic.get());
                assert.equal(topic.get(), ' "use strict";\n');
            },
            'use strict with spaces': {
                topic: function() {
                    var self = this,
                        jsstamp = require('../lib/tasks/jsstamp').jsstamp;

                    jsstamp({
                        strict: true
                    }, {
                        result: '  foobar',
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
                'use strict was applied': function(topic) {
                    assert.ok(topic.get());
                    assert.equal(topic.get(), '  "use strict";\n  foobar');
                },
            },
            'no options': {
                topic: function() {
                    var self = this,
                        jsstamp = require('../lib/tasks/jsstamp').jsstamp;

                    jsstamp(null, {
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
                'valid return': function(topic) {
                    assert.equal(topic.get(), '');
                }
            }
        },
        'tasks/compressor': {
            topic: function() {
                var compressor = require('../lib/tasks/compressor').compressor;
                return compressor;
            },
            'should return a function': function(topic) {
                assert.isFunction(topic);
            },
            'compress with no options': {
                topic: function(topic) {
                    process.env.SHIFTER_COMPRESSOR_TASKS = 0;
                    topic(null, {
                        result: "var foo = bar;",
                        constructor: function(result) {
                            this.result = result;
                            this.get = function() {
                                return this.result;
                            }
                        }
                    }, this.callback);
                },
                'should return': function(topic) {
                    assert.equal(topic.get(), "var foo=bar;");
                }
            },
            'compress with error': {
                topic: function(topic) {
                    var self = this;
                    delete process.env.SHIFTER_COMPRESSOR_TASKS;
                    topic(null, {
                        result: "var foo + bar;",
                        constructor: function(result) {
                            this.result = result;
                            this.get = function() {
                                return this.result;
                            }
                        }
                    }, function(err) {
                        self.callback(null, err);
                    });
                },
                'should return error': function(topic) {
                    assert.ok(topic.indexOf('[ERROR] 1:10:missing ; before statement') > -1);
                }
            },
            'compress many': {
                topic: function(topic) {
                    var stack = new Stack(),
                        self = this, results = [];
                    for (var i = 0; i < 10; i++) {
                        topic(null, {
                            result: "var foo = bar;",
                            constructor: function(result) {
                                this.result = result;
                                this.get = function() {
                                    return this.result;
                                }
                            }
                        }, stack.add(function(err, blob) {
                            results.push(blob.result);
                        }));
                    }
                    stack.done(function() {
                        self.callback(null, results);
                    });
                },
                'should return all items': function(topic) {
                    assert.equal(topic.length, 10);
                }
            }
        }
    }
};

vows.describe('general').addBatch(tests).export(module);
