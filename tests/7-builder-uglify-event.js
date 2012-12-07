var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    Stack = require('../lib/stack').Stack,
    spawn = require('child_process').spawn,
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/yql/'),
    crypto = require('crypto'),
    buildBase = path.join(base, 'build'),
    buildXBase = path.join(base, 'build-uglify'),
    srcBase = path.join(base, 'src/event'),
    rimraf = require('rimraf');


var tests = {
    'clean build': {
        topic: function() {
            rimraf(path.join(buildBase, 'event-base-ie'), this.callback);
        },
        'should not have build dir and': {
            topic: function() {
                var self = this;
                fs.stat(path.join(buildBase, 'event-base-ie'), function(err) {
                    self.callback(null, err);
                });
            },
            'should not have build/event-base-ie': function(foo, err) {
                assert.isNotNull(err);
                assert.equal(err.code, 'ENOENT');
            },
            'should build Event Base IE and': {
                topic: function() {
                    shifter.init({
                        silent: true,
                        cwd: srcBase,
                        'global-config': false,
                        'cache': false
                    }, this.callback);
                },
                'should create build dir and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'event-base-ie'), this.callback);
                    },
                    'should create build/event-base-ie': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                },
                'should create rollup build dir and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'event-base'), this.callback);
                    },
                    'should create build/event-base': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                },
                'should produce same files and': {
                    topic: function() {
                        var stack = new Stack();
                        var results = {
                            pre: {},
                            post: {}
                        },
                        self = this;

                        fs.readdir(path.join(buildBase, 'event-base-ie'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildBase, 'event-base-ie', file), stack.add(function(err, data) {
                                        var shasum = crypto.createHash('sha1');
                                        shasum.update(data);
                                        var d = shasum.digest('hex');
                                        results.post[file] = d;
                                    }));
                                }(file));
                            });
                        }));
                        
                        fs.readdir(path.join(buildXBase, 'event-base-ie'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildXBase, 'event-base-ie', file), stack.add(function(err, data) {
                                        var shasum = crypto.createHash('sha1');
                                        shasum.update(data);
                                        var d = shasum.digest('hex');
                                        results.pre[file] = d;
                                    }));
                                }(file));
                            });
                        }));
                        
                        stack.done(function() {
                            self.callback(null, results);
                        });

                    },
                    'min should be same with UglifyJS': function(err, results) {
                        assert.equal(results.pre['event-base-ie-min.js'], results.post['event-base-ie-min.js']);
                    },
                    'raw should be same': function(err, results) {
                        assert.equal(results.pre['event-base-ie.js'], results.post['event-base-ie.js']);
                    },
                    'debug should be same': function(err, results) {
                        assert.equal(results.pre['event-base-ie-debug.js'], results.post['event-base-ie-debug.js']);
                    },
                    'coverage should be same': function(err, results) {
                        assert.equal(results.pre['event-base-ie-coverage.js'], results.post['event-base-ie-coverage.js']);
                    }
                },
                'should produce same rollup files and': {
                    topic: function() {
                        var stack = new Stack();
                        var results = {
                            pre: {},
                            post: {}
                        },
                        self = this;

                        fs.readdir(path.join(buildBase, 'event-base'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildBase, 'event-base', file), stack.add(function(err, data) {
                                        var shasum = crypto.createHash('sha1');
                                        shasum.update(data);
                                        var d = shasum.digest('hex');
                                        results.post[file] = d;
                                    }));
                                }(file));
                            });
                        }));
                        
                        fs.readdir(path.join(buildXBase, 'event-base'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildXBase, 'event-base', file), stack.add(function(err, data) {
                                        var shasum = crypto.createHash('sha1');
                                        shasum.update(data);
                                        var d = shasum.digest('hex');
                                        results.pre[file] = d;
                                    }));
                                }(file));
                            });
                        }));
                        
                        stack.done(function() {
                            self.callback(null, results);
                        });

                    },
                    'min should be same with UglifyJS': function(err, results) {
                        assert.equal(results.pre['event-base-min.js'], results.post['event-base-min.js']);
                    },
                    'raw should be same': function(err, results) {
                        assert.equal(results.pre['event-base.js'], results.post['event-base.js']);
                    },
                    'debug should be same': function(err, results) {
                        assert.equal(results.pre['event-base-debug.js'], results.post['event-base-debug.js']);
                    },
                    'coverage should be same': function(err, results) {
                        assert.equal(results.pre['event-base-coverage.js'], results.post['event-base-coverage.js']);
                    }
                }
            }
        }
    }
};

vows.describe('building event with UglifyJS').addBatch(tests).export(module);
