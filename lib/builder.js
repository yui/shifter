/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var path = require('path'),
    fs = require('fs'),
    log = require('./log'),
    noop = function() {},
    timer = require('./timer'),
    Stack = require('./stack').Stack,
    module = require('./module');

var has = function(opt, name) {
    var ret = false;

    var ret = opt.some(function(v) {
        return (v === name);
    });

    return ret;
};

exports.start = function(json, options) {
    log.info('putting the hammer down');
    var stack = new Stack(),
        start = new Date();

    if (options.modules) {
        log.info('limiting to: ' + options.modules);
    }

    Object.keys(json.builds).forEach(function(name) {
        var mod = json.builds[name];
        if (!options.modules || has(options.modules, name)) {
            log.info('shifting into gear for ' + name);
            module.build(mod, name, options, stack.add(noop));
        }
    });
    
    stack.done(function() {
        var s = new Stack();
        if (json.rollups) {
            log.info('build has rollup builds, shifting them now');
            Object.keys(json.rollups).forEach(function(name) {
                var mod = json.rollups[name];
                if (!options.modules || has(options.modules, name)) {
                    log.info('shifting into gear for ' + name);
                    module.rollup(mod, name, options, s.add(noop));
                }
            });
        }

        s.done(function() {
            var end = new Date();
            log.info('done racing, the gears are toast');
            log.info('finished in ' + timer.calc(start, end) + ', pretty fast huh?');
        });
    });
};

