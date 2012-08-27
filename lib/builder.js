/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var path = require('path'),
    fs = require('fs'),
    log = require('./log'),
    noop = function () {},
    timer = require('./timer'),
    spawn = require('child_process').spawn,
    Stack = require('./stack').Stack,
    module = require('./module');

var has = function (opt, name) {
    return opt.some(function (v) {
        return (v === name);
    });
};

var prebuild = function (jobs, options, callback) {
    var stack = new Stack();

    jobs.forEach(function (job) {
        log.info('shifting build for: ' + job);
        var args = [],
            child;

        if (options.lint) {
            args.push('--lint');
            args.push(options.lint);
        }
        child = spawn('shifter', args, {
            cwd: path.join(process.cwd(), '../', job)
        });

        child.stdout.on('data', function (data) {
            process.stdout.write(data.toString());
        });

        child.on('exit', stack.add(function () {
            log.info('build for ' + job + ' complete, downshifting');
        }));
    });

    stack.done(callback);
};

exports.start = function (json, options, skip) {
    log.info('putting the hammer down');
    var stack = new Stack(),
        start = new Date(),
        end = function () {
            var end = new Date();
            log.info('done racing, the gears are toast');
            log.info('finished in ' + timer.calc(start, end) + ', pretty fast huh?');
        },
        post = function (json, callback) {
            if (json.postbuilds) {
                log.info('found a postbuild, shifting it');
                prebuild(json.postbuilds, options, function () {
                    delete json.postbuilds;
                    post(json, callback);
                });
            } else if (json.postexec) {
                module.exec(json.postexec, function () {
                    delete json.postexec;
                    post(json, callback);
                });
            } else {
                callback();
            }
        };

    if (json.prebuilds && !skip) {
        log.info('found a prebuild, shifting it');
        prebuild(json.prebuilds, options, function () {
            exports.start(json, options, true);
        });
        return;
    }

    if (json.exec && !skip) {
        log.info('found a global exec, shifting it');
        module.exec(json.exec, function () {
            exports.start(json, options, true);
        });
        return;
    }

    if (options.modules) {
        log.info('limiting to: ' + options.modules);
    }

    Object.keys(json.builds).forEach(function (name) {
        var mod = json.builds[name];
        if (!options.modules || has(options.modules, name)) {
            log.info('shifting into gear for ' + name);
            module.build(mod, name, options, stack.add(noop));
        }
    });

    stack.done(function () {
        var rollups = [];
        if (json.rollups) {
            log.info('build has rollup builds, shifting them now');
            Object.keys(json.rollups).forEach(function (name) {
                var mod = json.rollups[name];
                if (!options.modules || has(options.modules, name)) {
                    log.info('shifting into gear for ' + name);
                    rollups.push({
                        mod: mod,
                        name: name,
                        options: options
                    });
                }
            });
            module.rollup(rollups, function () {
                post(json, end);
            });
        } else {
            post(json, end);
        }

    });
};

