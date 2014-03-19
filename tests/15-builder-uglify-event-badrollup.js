var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/badrollup/'),
    buildBase = path.join(base, 'build'),
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
                        fs.stat(path.join(buildBase, 'foo'), this.callback);
                    },
                    'should create build/foo': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                }
            }
        }
    }
};

vows.describe('building badrollup with UglifyJS').addBatch(tests).export(module);
