var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    Stack = require('../lib/stack').Stack,
    spawn = require('child_process').spawn,
    shifter = require('../lib'),
    base = path.join(__dirname, 'assets/copy/'),
    crypto = require('crypto'),
    buildBase = path.join(base, 'out'),
    buildXBase = path.join(base, 'out-expected'),
    srcBase = path.join(base, 'src/in'),
    rimraf = require('rimraf');

var tests = {
    'clean build': {
        topic: function() {
            rimraf(path.join(buildBase), this.callback);
        },
        'should not have previous build dir and': {
            topic: function() {
                var self = this;
                fs.stat(path.join(buildBase), function(err) {
                    self.callback(null, err);
                });
            },
            'it does not': function(foo, err) {
                assert.isNotNull(err);
                assert.equal(err.code, 'ENOENT');
            },
            'should copy': {
                topic: function() {
                    shifter.add({
                        cwd: srcBase,
                        'global-config': false
                    }, this.callback);
                },
                'should create out/1 and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, '1'), this.callback);
                    },
                    'should create out/1': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isDirectory());
                    }
                },
                'should create out/1/foo.txt and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, '1', 'foo.txt'), this.callback);
                    },
                    'should create out/1/foo.txt': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isFile());
                    }
                },
                'should create out/foo.txt and': {
                    topic: function() {
                        fs.stat(path.join(buildBase, 'foo.txt'), this.callback);
                    },
                    'should create out/foo.txt': function(err, stat) {
                        assert.isNull(err);
                        assert.isTrue(stat.isFile());
                    }
                },
                'should NOT create out/.foo and': {
                    topic: function() {
                        var self = this;
                        fs.stat(path.join(buildBase, '.foo'), function(err, stat) {
                            self.callback(null, err);
                        });
                    },
                    'should not exist': function(stat) {
                        assert.ok(stat);
                        assert.equal(stat.code, 'ENOENT');
                    }
                },
                'should NOT create out/.bar and': {
                    topic: function() {
                        var self = this;
                        fs.stat(path.join(buildBase, '.bar'), function(err, stat) {
                            self.callback(null, err);
                        });
                    },
                    'should not exist': function(stat) {
                        assert.ok(stat);
                        assert.equal(stat.code, 'ENOENT');
                    }
                }
            }
        }
    }
};

vows.describe('Copy Task').addBatch(tests).export(module);
