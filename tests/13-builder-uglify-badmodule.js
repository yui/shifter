var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/badmodule/'),
    buildBase = path.join(base, 'build'),
    srcBase = path.join(base, 'src/foo'),
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

                    shifter.add({
                        silent: false,
                        cwd: srcBase,
                        compressor: false,
                        'global-config': false,
                        'cache': false,
                        lint: 'config',
                        'replace-version': '1.2.3.4'
                    }, function(err) {
                        self.callback(null, err);
                    });
                },
                'should fail with an error': function (foo, err) {
                    assert.isNotNull(err);
                },
                'should fail with an error message': function(foo, err) {
                    assert.isString(err.toString());
                }
            }
        }
    }
};

vows.describe('building badmodule with UglifyJS').addBatch(tests).export(module);
