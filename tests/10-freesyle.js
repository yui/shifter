var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    Stack = require('../lib/stack').Stack,
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/freestyle/'),
    crypto = require('crypto'),
    buildBase = path.join(base, 'build'),
    buildXBase = path.join(base, 'build-expected'),
    srcBase = path.join(base, 'src/something'),
    rimraf = require('rimraf');


var tests = {
    'clean build': {
        topic: function() {
            rimraf(path.join(buildBase, 'foo'), this.callback);
        },
        'should not have build dir and': {
            topic: function() {
                var self = this;
                fs.stat(path.join(buildBase, 'foo'), function(err) {
                    self.callback(null, err);
                });
            },
            'should not have build/foo': function(foo, err) {
                assert.isNotNull(err);
                assert.equal(err.code, 'ENOENT');
            },
            'should build foo and': {
                topic: function() {
                    shifter.init({
                        cwd: srcBase,
                        lint: false,
                        csslint: false,
                        compressor: true,
                        'global-config': false,
                        cache: false,
                        'yui-module': path.join(srcBase, 'foo.js')
                    }, this.callback);
                },
                'should create build dir and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'foo'), this.callback);
                    },
                    'should create build/foo': function(err, stat) {
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

                        fs.readdir(path.join(buildBase, 'foo'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildBase, 'foo', file), stack.add(function(err, data) {
                                        var shasum = crypto.createHash('sha1');
                                        shasum.update(data);
                                        results.post[file] = shasum.digest('hex');
                                    }));
                                }(file));
                            });
                        }));

                        fs.readdir(path.join(buildXBase, 'foo'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildXBase, 'foo', file), stack.add(function(err, data) {
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
                    'min should be same with YUI Compressor': function(err, results) {
                        assert.equal(results.pre['foo-min.js'], results.post['foo-min.js']);
                    },
                    'raw should be same': function(err, results) {
                        assert.equal(results.pre['foo.js'], results.post['foo.js']);
                    },
                    'debug should be same': function(err, results) {
                        assert.equal(results.pre['foo-debug.js'], results.post['foo-debug.js']);
                    },
                    'coverage should be same': function(err, results) {
                        assert.equal(results.pre['foo-coverage.js'], results.post['foo-coverage.js']);
                    }
                }
            }
        }
    }
};

vows.describe('building freestyle module').addBatch(tests).export(module);
