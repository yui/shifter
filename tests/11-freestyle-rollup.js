var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    Stack = require('../lib/stack').Stack,
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/freestyle/'),
    crypto = require('crypto'),
    buildBase = path.join(base, 'build'),
    buildXBase = path.join(base, 'build-rollup-expected'),
    srcBase = path.join(base, 'src/something'),
    rimraf = require('rimraf');


var tests = {
    'clean build': {
        topic: function() {
            rimraf(path.join(buildBase, 'bar'), this.callback);
        },
        'should not have build dir and': {
            topic: function() {
                var self = this;
                fs.stat(path.join(buildBase, 'bar'), function(err) {
                    self.callback(null, err);
                });
            },
            'should not have build/bar': function(foo, err) {
                assert.isNotNull(err);
                assert.equal(err.code, 'ENOENT');
            },
            'should build rollup and': {
                topic: function() {
                    shifter.init({
                        cwd: srcBase,
                        lint: false,
                        csslint: false,
                        coverage: false,
                        compressor: false,
                        'global-config': false,
                        cache: false,
                        'yui-module': path.join(srcBase, 'rollup.js')
                    }, this.callback);
                },
                'should create build/bar dir and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'bar'), this.callback);
                    },
                    'should create build/bar': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                },
                'should create build/baz dir and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'baz'), this.callback);
                    },
                    'should create build/baz': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                },
                'should produce same files and': {
                    topic: function() {
                        var stack = new Stack(),
                            results = {
                                pre: {},
                                post: {}
                            },
                            self = this;

                        fs.readdir(path.join(buildBase, 'bar'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildBase, 'bar', file), stack.add(function(err, data) {
                                        var shasum = crypto.createHash('sha1');
                                        shasum.update(data);
                                        results.post[file] = shasum.digest('hex');
                                    }));
                                }(file));
                            });
                        }));

                        fs.readdir(path.join(buildBase, 'baz'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildBase, 'baz', file), stack.add(function(err, data) {
                                        var shasum = crypto.createHash('sha1');
                                        shasum.update(data);
                                        results.post[file] = shasum.digest('hex');
                                    }));
                                }(file));
                            });
                        }));

                        fs.readdir(path.join(buildXBase, 'bar'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildXBase, 'bar', file), stack.add(function(err, data) {
                                        var shasum = crypto.createHash('sha1');
                                        shasum.update(data);
                                        results.pre[file] = shasum.digest('hex');
                                    }));
                                }(file));
                            });
                        }));

                        fs.readdir(path.join(buildXBase, 'baz'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildXBase, 'baz', file), stack.add(function(err, data) {
                                        var shasum = crypto.createHash('sha1');
                                        shasum.update(data);
                                        results.pre[file] = shasum.digest('hex');
                                    }));
                                }(file));
                            });
                        }));

                        stack.done(function() {
                            self.callback(null, results);
                        });

                    },
                    'min should be same for bar module': function(err, results) {
                        assert.equal(results.pre['bar-min.js'], results.post['bar-min.js']);
                    },
                    'raw should be same for bar module': function(err, results) {
                        assert.equal(results.pre['bar.js'], results.post['bar.js']);
                    },
                    'debug should be same for bar module': function(err, results) {
                        assert.equal(results.pre['bar-debug.js'], results.post['bar-debug.js']);
                    },
                    'min should be same for baz module': function(err, results) {
                        assert.equal(results.pre['baz-min.js'], results.post['baz-min.js']);
                    },
                    'raw should be same for baz module': function(err, results) {
                        assert.equal(results.pre['baz.js'], results.post['baz.js']);
                    },
                    'debug should be same for baz module': function(err, results) {
                        assert.equal(results.pre['baz-debug.js'], results.post['baz-debug.js']);
                    },
                }
            }
        }
    }
};

vows.describe('building freestyle rollup').addBatch(tests).export(module);
