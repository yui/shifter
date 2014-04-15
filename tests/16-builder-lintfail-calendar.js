var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/yql/'),
    buildBase = path.join(base, 'build'),
    srcBase = path.join(base, 'src/calendar'),
    rimraf = require('rimraf');

var tests = {
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
            'should attempt to build Calendar and': {
                topic: function() {
                    var self = this,
                        _exit = process.exit;

                    process.exit = function(code) {
                        process.exit = _exit;
                        self.callback(null, {
                            code: code
                        });
                    };

                    shifter.add({
                        silent: true,
                        cwd: srcBase,
                        'global-config': false,
                        'lint-stderr': true,
                        csslint: false,
                        fail: true,
                        'cache': false,
                        cssproc: 'http://foobar.com/baz/'
                    }); // No callback provided to test that process.exit(1) happens on error if no callback
                },
                'should have failed with lint errors': function(topic) {
                    assert.equal(topic.code, 1);
                },
                'should not create build dir': {
                    topic: function() {
                        var self = this;
                        fs.stat(path.join(buildBase, 'calendar'), function(err) {
                            self.callback(null, err);
                        });
                    },
                    'should create build/calendar': function(foo, err) {
                        assert.isNotNull(err);
                        assert.equal(err.code, 'ENOENT');
                    }
                }
            }
        }
    }
};

vows.describe('building calendar with lint errors and `fail: true`').addBatch(tests).export(module);
