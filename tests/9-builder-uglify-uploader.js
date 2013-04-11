var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    Stack = require('../lib/stack').Stack,
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/yql/'),
    crypto = require('crypto'),
    buildBase = path.join(__dirname, 'assets-global'),
    buildXBase = path.join(base, 'build-uglify'),
    srcBase = path.join(base, 'src/uploader'),
    rimraf = require('rimraf');


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
            'should not have build/uploader': function(foo, err) {
                assert.isNotNull(err);
                assert.equal(err.code, 'ENOENT');
            },
            'should build Uploader and': {
                topic: function() {
                    shifter.init({
                        quiet: true,
                        cwd: srcBase,
                        'global-config': true,
                        'cache': false
                    }, this.callback);
                },
                'should create build dir and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'uploader'), this.callback);
                    },
                    'should create build/uploader': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                },
                'should create assets dir and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'uploader', 'assets'), this.callback);
                    },
                    'should create build/uploader/assets': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                },
                'should create assets/uploader-flash-core.css and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'uploader', 'assets', 'uploader-flash-core.css'), this.callback);
                    },
                    'should create build/uploader/assets/uploader-flash-core.css': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isFile());
                    }
                },
                'should create assets/flashuploader.swf and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'uploader', 'assets', 'flashuploader.swf'), this.callback);
                    },
                    'should create build/uploader/assets/flashuploader.swf': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isFile());
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

                        fs.readdir(path.join(buildBase, 'uploader'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                if (path.extname(file) === '.js') {
                                    (function(file) {
                                        fs.readFile(path.join(buildBase, 'uploader', file), stack.add(function(err, data) {
                                            var shasum = crypto.createHash('sha1');
                                            shasum.update(data);
                                            var d = shasum.digest('hex');
                                            results.post[file] = d;
                                        }));
                                    }(file));
                                }
                            });
                        }));

                        fs.readdir(path.join(buildXBase, 'uploader'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                if (path.extname(file) === '.js') {
                                    (function(file) {
                                        fs.readFile(path.join(buildXBase, 'uploader', file), stack.add(function(err, data) {
                                            var shasum = crypto.createHash('sha1');
                                            shasum.update(data);
                                            var d = shasum.digest('hex');
                                            results.pre[file] = d;
                                        }));
                                    }(file));
                                }
                            });
                        }));

                        stack.done(function() {
                            self.callback(null, results);
                        });

                    },
                    'min should be same with UglifyJS': function(err, results) {
                        assert.equal(results.pre['uploader-min.js'], results.post['uploader-min.js']);
                    },
                    'raw should be same': function(err, results) {
                        assert.equal(results.pre['uploader.js'], results.post['uploader.js']);
                    },
                    'debug should be same': function(err, results) {
                        assert.equal(results.pre['uploader-debug.js'], results.post['uploader-debug.js']);
                    },
                    'coverage should be same': function(err, results) {
                        assert.equal(results.pre['uploader-coverage.js'], results.post['uploader-coverage.js']);
                    }
                }
            }
        }
    }
};

vows.describe('building uploader with UglifyJS').addBatch(tests).export(module);
