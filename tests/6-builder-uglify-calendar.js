var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    Stack = require('../lib/stack').Stack,
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/yql/'),
    crypto = require('crypto'),
    buildBase = path.join(base, 'build'),
    buildXBase = path.join(base, 'build-uglify'),
    srcBase = path.join(base, 'src/calendar'),
    rimraf = require('rimraf');

function createTests(buildSkin) {
    return {
        'clean build': {
            topic: function() {
                var self = this;
                rimraf(path.join(buildBase, 'calendar-base'), function() {
                    rimraf(path.join(buildBase, 'calendarnavigator'), function() {
                        rimraf(path.join(buildBase, 'calendar'), self.callback);
                    });
                });
            },
            'should not have build dir and': {
                topic: function() {
                    var self = this;
                    fs.stat(path.join(buildBase, 'calendar'), function(err) {
                        self.callback(null, err);
                    });
                },
                'should not have build/calendar': function(foo, err) {
                    assert.isNotNull(err);
                    assert.equal(err.code, 'ENOENT');
                },
                'should build Calendar and': (function() {
                    var context = {
                        topic: function() {
                            var self = this;

                            shifter.add({
                                silent: true,
                                cwd: srcBase,
                                'global-config': false,
                                'lint-stderr': true,
                                csslint: false,
                                fail: false,
                                'cache': false,
                                cssproc: 'http://foobar.com/baz/',
                                assets: buildSkin
                            }, function(err) {
                                self.callback(err);
                            });
                        },
                        'should create build dir and': {
                            topic: function() {
                                fs.stat(path.join(buildBase, 'calendar'), this.callback);
                            },
                            'should create build/calendar': function(err, stat) {
                                assert.isNull(err);
                                assert.isTrue(stat.isDirectory());
                            }
                        },
                        'should create lang dir and': {
                            topic: function() {
                                fs.stat(path.join(buildBase, 'calendar', 'lang'), this.callback);
                            },
                            'should create build/calendar/lang': function(err, stat) {
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

                                fs.readdir(path.join(buildBase, 'calendar'), stack.add(function(err, files) {
                                    files.forEach(function(file) {
                                        if (path.extname(file) === '.js') {
                                            (function(file) {
                                                fs.readFile(path.join(buildBase, 'calendar', file), stack.add(function(err, data) {
                                                    var shasum = crypto.createHash('sha1');
                                                    shasum.update(data);
                                                    var d = shasum.digest('hex');
                                                    results.post[file] = d;
                                                }));
                                            }(file));
                                        }
                                    });
                                }));

                                fs.readdir(path.join(buildXBase, 'calendar'), stack.add(function(err, files) {
                                    files.forEach(function(file) {
                                        if (path.extname(file) === '.js') {
                                            (function(file) {
                                                fs.readFile(path.join(buildXBase, 'calendar', file), stack.add(function(err, data) {
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
                                assert.equal(results.pre['calendar-min.js'], results.post['calendar-min.js']);
                            },
                            'raw should be same': function(err, results) {
                                assert.equal(results.pre['calendar.js'], results.post['calendar.js']);
                            },
                            'debug should be same': function(err, results) {
                                assert.equal(results.pre['calendar-debug.js'], results.post['calendar-debug.js']);
                            },
                            'coverage should be same': function(err, results) {
                                assert.equal(results.pre['calendar-coverage.js'], results.post['calendar-coverage.js']);
                            }
                        }
                    };

                    if (buildSkin) {
                        context['should create assets dir and'] = {
                            topic: function() {
                                fs.stat(path.join(buildBase, 'calendar', 'assets'), this.callback);
                            },
                            'should create build/calendar/assets': function(err, stat) {
                                assert.isNull(err);
                                assert.isTrue(stat.isDirectory());
                            }
                        };
                        context['should create assets/skins/sam/ dir and'] = {
                            topic: function() {
                                fs.stat(path.join(buildBase, 'calendar', 'assets', 'skins', 'sam'), this.callback);
                            },
                            'should create build/calendar/assets/skins/sam': function(err, stat) {
                                assert.isNull(err);
                                assert.isTrue(stat.isDirectory());
                            }
                        };
                        context['should create assets/skins/sam/calendar.css and'] = {
                            topic: function() {
                                fs.stat(path.join(buildBase, 'calendar', 'assets', 'skins', 'sam', 'calendar.css'), this.callback);
                            },
                            'should create build/calendar/assets/skins/sam/calendar.css': function(err, stat) {
                                assert.isNull(err);
                                assert.isTrue(stat.isFile());
                            }
                        };
                        context['should create assets/skins/sam/calendar-skin.css and'] = {
                            topic: function() {
                                fs.readFile(path.join(buildBase, 'calendar', 'assets', 'skins', 'sam', 'calendar-skin.css'), this.callback);
                            },
                            'should have processed the relative CSS files': function(err, stat) {
                                assert.isNull(err);
                                assert.isTrue(stat.toString().indexOf('http://foobar.com/baz/calendar/assets/skins/sam/my-image.png') > -1);
                            }
                        };
                        context['should create calendar-base/assets dir and'] = {
                            topic: function() {
                                fs.stat(path.join(buildBase, 'calendar-base', 'assets'), this.callback);
                            },
                            'should override mod.assets=false when skinnable': function(err, stat) {
                                assert.isNull(err);
                                assert.isTrue(stat.isDirectory());
                            }
                        };
                    } else {
                        context['should not create assets dir and'] = {
                            topic: function() {
                                var self = this;
                                fs.stat(path.join(buildBase, 'calendar', 'assets'), function(err) {
                                    self.callback(null, err);
                                });
                            },
                            'should not create build/calendar/assets': function(foo, err) {
                                assert.isNotNull(err);
                                assert.equal(err.code, 'ENOENT');
                            }
                        };
                    }

                    return context;
                }())
            }
        }
    };
}

vows.describe('building calendar with UglifyJS').addBatch(createTests(true)).export(module);
vows.describe('building calendar with UglifyJS and --no-assets').addBatch(createTests(false)).export(module);
