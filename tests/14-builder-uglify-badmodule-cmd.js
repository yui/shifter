var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
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
                    var self = this,
                        child;

                    process.chdir(path.resolve(base, srcBase));

                    child = exec('../../../../../bin/shifter --no-global-config', function (error, stdout, stderr) {
                        self.callback(null, {
                            error: error,
                            stderr: stderr
                        });
                    });
                },
                'should fail with an error code 1': function (topic) {
                    assert.equal(topic.error.code, 1);
                },
                'should fail with an error message': function(topic) {
                    assert.isNotNull(topic.stderr);
                }
            }
        }
    }
};

vows.describe('building badmodule with UglifyJS via command line').addBatch(tests).export(module);
