var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/badrollup/'),
    buildBase = path.join(base, 'build'),
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
                    var self = this;

                    shifter.init({
                        silent: true,
                        cwd: srcBase,
                        'global-config': false,
                        'cache': false
                    }, function (err) {
                        self.callback(null, err);
                    });
                },
                'should fail with an error': function (foo, err) {
                    assert.isNotNull(err);
                },
                'should create build dir and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'event-base-ie'), this.callback);
                    },
                    'should create build/event-base-ie': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                }
            }
        }
    }
};

vows.describe('building badrollup event with UglifyJS').addBatch(tests).export(module);
