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
    buildXBase = path.join(base, 'build-csswithassets'),
    srcBase = path.join(base, 'src/csswithassets'),
    rimraf = require('rimraf');


var tests = {
    'clean build': {
        topic: function() {
            rimraf(path.join(buildBase, 'csswithassets'), this.callback);
        },
        'should not have build dir and': {
            topic: function() {
                var self = this;
                fs.stat(path.join(buildBase, 'csswithassets'), function(err) {
                    self.callback(null, err);
                });
            },
            'should not have build/csswithassets': function(foo, err) {
                assert.isNotNull(err);
                assert.equal(err.code, 'ENOENT');
            },
            'should build csswithassets and': {
                topic: function() {
                    shifter.init({
                        silent: true,
                        cwd: srcBase,
                        'global-config': false,
                        cache: false,
                        cssproc: 'http://domain.name/path/'
                    }, this.callback);
                },
                'should create build dir and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'csswithassets'), this.callback);
                    },
                    'should create build/csswithassets': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                },
                'should honor cssproc and': {
                    topic: function() {
                        var file = path.join(buildBase, 'csswithassets', 'csswithassets.css');
                        return fs.readFileSync(file, 'utf8');
                    },
                    'should have added the proper token': function(topic) {
                        assert.isTrue(/http\:\/\/domain\.name\/path\//.test(topic));
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

                        fs.readdir(path.join(buildBase, 'csswithassets'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    if (path.extname(file) === '.css') {
                                        fs.readFile(path.join(buildBase, 'csswithassets', file), stack.add(function(err, data) {
                                            var shasum = crypto.createHash('sha1');
                                            console.error(file, data);
                                            shasum.update(data);
                                            var d = shasum.digest('hex');
                                            results.post[file] = d;
                                        }));
                                    }
                                }(file));
                            });
                        }));

                        fs.readdir(path.join(buildXBase, 'csswithassets'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    if (path.extname(file) === '.css') {
                                        fs.readFile(path.join(buildXBase, 'csswithassets', file), stack.add(function(err, data) {
                                            var shasum = crypto.createHash('sha1');
                                            shasum.update(data);
                                            var d = shasum.digest('hex');
                                            results.pre[file] = d;
                                        }));
                                    }
                                }(file));
                            });
                        }));

                        stack.done(function() {
                            self.callback(null, results);
                        });

                    },
                    'min should be same with cssmin': function(err, results) {
                        assert.ok(results.pre['csswithassets-min.css']);
                        assert.ok(results.post['csswithassets-min.css']);
                        assert.equal(results.pre['csswithassets-min.css'], results.post['csswithassets-min.css']);
                    },
                    'raw should be same without cssmin': function(err, results) {
                        assert.ok(results.pre['csswithassets.css']);
                        assert.ok(results.post['csswithassets.css']);
                        assert.equal(results.pre['csswithassets.css'], results.post['csswithassets.css']);
                    }
                },
                'should have copied the assets folder and': {
                    topic: function() {
                        var stack = new Stack();
                        var results = {
                            pre: {},
                            post: {}
                        },
                        self = this;

                        fs.readdir(path.join(buildBase, 'csswithassets/assets'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    if (path.extname(file) === '.png') {
                                        fs.readFile(path.join(buildBase, 'csswithassets/assets', file), stack.add(function(err, data) {
                                            var shasum = crypto.createHash('sha1');
                                            console.error(file, data);
                                            shasum.update(data);
                                            var d = shasum.digest('hex');
                                            results.post[file] = d;
                                        }));
                                    }
                                }(file));
                            });
                        }));

                        fs.readdir(path.join(buildXBase, 'csswithassets/assets'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    if (path.extname(file) === '.png') {
                                        fs.readFile(path.join(buildXBase, 'csswithassets/assets', file), stack.add(function(err, data) {
                                            var shasum = crypto.createHash('sha1');
                                            shasum.update(data);
                                            var d = shasum.digest('hex');
                                            results.pre[file] = d;
                                        }));
                                    }
                                }(file));
                            });
                        }));

                        stack.done(function() {
                            self.callback(null, results);
                        });

                    },
                    'png image should be copied': function(err, results) {
                        assert.ok(results.pre['img.png']);
                        assert.ok(results.post['img.png']);
                        assert.equal(results.pre['img.png'], results.post['img.png']);
                    }
                }
            }
        }
    }
};

vows.describe('building csswithassets with UglifyJS').addBatch(tests).export(module);
