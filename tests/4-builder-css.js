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
    buildXBase = path.join(base, 'build-cssmin'),
    srcBase = path.join(base, 'src/cssreset'),
    rimraf = require('rimraf');


var tests = {
    'clean build': {
        topic: function() {
            rimraf(path.join(buildBase, 'cssreset'), this.callback);
        },
        'should not have build dir and': {
            topic: function() {
                var self = this;
                fs.stat(path.join(buildBase, 'cssreset'), function(err) {
                    self.callback(null, err);
                });
            },
            'should not have build/cssreset': function(foo, err) {
                assert.isNotNull(err);
                assert.equal(err.code, 'ENOENT');
            },
            'should build cssreset and': {
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
                        fs.stat(path.join(buildBase, 'cssreset'), this.callback);
                    },
                    'should create build/cssreset': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                },
                'should replace content and': {
                    topic: function() {
                        var file = path.join(buildBase, 'cssreset', 'cssreset.css');
                        return fs.readFileSync(file, 'utf8');
                    },
                    'should not have @ tokens': function(topic) {
                        assert.isFalse(/@/.test(topic));
                    },
                    'should have replace token': function(topic) {
                        assert.isTrue(/#davglass/.test(topic));
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

                        fs.readdir(path.join(buildBase, 'cssreset'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildBase, 'cssreset', file), stack.add(function(err, data) {
                                        var shasum = crypto.createHash('sha1');
                                        shasum.update(data);
                                        var d = shasum.digest('hex');
                                        results.post[file] = d;
                                    }));
                                }(file));
                            });
                        }));
                        
                        fs.readdir(path.join(buildXBase, 'cssreset'), stack.add(function(err, files) {
                            files.forEach(function(file) {
                                (function(file) {
                                    fs.readFile(path.join(buildXBase, 'cssreset', file), stack.add(function(err, data) {
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
                    'min should be same with cssmin': function(err, results) {
                        assert.ok(results.pre['cssreset-min.css']);
                        assert.ok(results.post['cssreset-min.css']);
                        assert.equal(results.pre['cssreset-min.css'], results.post['cssreset-min.css']);
                    },
                    'raw should be same without cssmin': function(err, results) {
                        assert.ok(results.pre['cssreset.css']);
                        assert.ok(results.post['cssreset.css']);
                        assert.equal(results.pre['cssreset.css'], results.post['cssreset.css']);
                    }
                }
            }
        }
    }
};

vows.describe('building cssreset with UglifyJS').addBatch(tests).export(module);
