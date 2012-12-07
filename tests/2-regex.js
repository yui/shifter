var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    Stack = require('../lib/stack').Stack,
    // log = require('../lib/log'),
    // spawn = require('child_process').spawn,
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/regex/'),
    crypto = require('crypto'),
    buildBase = path.join(base, 'build'),
    buildXBase = path.join(base, 'build-expected'),
    srcBase1 = path.join(base, 'src/module-1'),
    srcBase2 = path.join(base, 'src/module-2'),
    rimraf = require('rimraf');

process.env.SHIFTER_COMPRESSOR_TASKS = 1;

var tests = {
    'clean build': {
        topic: function() {
            rimraf(path.join(buildBase), this.callback);
        },
        'should not have build dir and': {
            topic: function() {
                var self = this;
                fs.stat(path.join(buildBase), function(err) {
                    self.callback(null, err);
                });
            },
            'should not have build': function(err, stat) {
                assert.isNotNull(stat);
                assert.equal(stat.code, 'ENOENT');
            },
            'should build module 1 and': {
                topic: function() {
                    shifter.init({
                        cwd: srcBase1,
                        csslint: false,
                        compressor: false,
                        'global-config': true,
                        'cache': false
                    }, this.callback);
                },
                'should create build dir #1': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'module-1'), this.callback);
                    },
                    'should create build/module-1': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                },
                'should build module 2 and': {
                    topic: function() {
                        shifter.init({
                            cwd: srcBase2,
                            csslint: false,
                            compressor: false,
                            'global-config': true,
                            'cache': false
                        }, this.callback);
                    },
                    'should create build dir #2': {
                        topic: function() {
                            fs.stat(path.join(buildBase, 'module-2'), this.callback);
                        },
                        'should create build/module-2': function(err, stat) {
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

                            fs.readdir(path.join(buildBase, 'module-1'), stack.add(function(err, files) {
                                files.forEach(function(file) {
                                    (function(file) {
                                        fs.readFile(path.join(buildBase, 'module-1', file), stack.add(function(err, data) {
                                            var shasum = crypto.createHash('sha1');
                                            shasum.update(data);
                                            var d = shasum.digest('hex');
                                            results.post[file] = d;
                                        }));
                                    }(file));
                                });
                            }));

                            fs.readdir(path.join(buildXBase, 'module-1'), stack.add(function(err, files) {
                                files.forEach(function(file) {
                                    (function(file) {
                                        fs.readFile(path.join(buildXBase, 'module-1', file), stack.add(function(err, data) {
                                            var shasum = crypto.createHash('sha1');
                                            shasum.update(data);
                                            var d = shasum.digest('hex');
                                            results.pre[file] = d;
                                        }));
                                    }(file));
                                });
                            }));
                            fs.readdir(path.join(buildBase, 'module-2'), stack.add(function(err, files) {
                                files.forEach(function(file) {
                                    (function(file) {
                                        fs.readFile(path.join(buildBase, 'module-2', file), stack.add(function(err, data) {
                                            var shasum = crypto.createHash('sha1');
                                            shasum.update(data);
                                            var d = shasum.digest('hex');
                                            results.post[file] = d;
                                        }));
                                    }(file));
                                });
                            }));

                            fs.readdir(path.join(buildXBase, 'module-2'), stack.add(function(err, files) {
                                files.forEach(function(file) {
                                    (function(file) {
                                        fs.readFile(path.join(buildXBase, 'module-2', file), stack.add(function(err, data) {
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
                        'min should be the same': function(err, results) {
                          assert.equal(results.pre['module-1-min.js'], results.post['module-1-min.js']);
                          assert.equal(results.pre['module-2-min.js'], results.post['module-2-min.js']);
                        },
                        'debug should be the same': function(err, results) {
                          assert.equal(results.pre['module-1-debug.js'], results.post['module-1-debug.js']);
                          assert.equal(results.pre['module-2-debug.js'], results.post['module-2-debug.js']);
                        },
                        'raw should be the same': function(err, results) {
                          assert.equal(results.pre['module-1.js'], results.post['module-1.js']);
                          assert.equal(results.pre['module-2.js'], results.post['module-2.js']);
                        }
                    }
                },
            },
        }
    }
};

vows.describe('building modules with different regex options').addBatch(tests).export(module);
