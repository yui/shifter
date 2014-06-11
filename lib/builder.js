/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var path = require('path'),
    log = require('./log'),
    noop = function () {},
    util = require('./util'),
    shifter = require('./index'),
    timer = require('timethat'),
    spawn = require('child_process').spawn,
    Stack = require('./stack').Stack,
    pack = require('./pack'),
    fs = require('fs'),
    smodule = require('./module');

var has = function (opt, name) {
    return opt.some(function (v) {
        return (v === name);
    });
};

exports.reset = smodule.reset;

var prebuild = function (jobs, options, callback) {
    var stack = new Stack();

    jobs.forEach(function (job) {
        log.info('shifting build for: ' + job);
        var args = [],
            child;

        if (options['build-dir']) {
            args.push('--build-dir');
            args.push(options['build-dir']);
        }
        if (options['global-config'] === false) {
            args.push('--no-global-config');
        }
        if (options.lint) {
            args.push('--lint');
            args.push(options.lint);
        }
        if (options.lint === false) {
            args.push('--no-lint');
        }
        if (options.uglify) {
            args.push('--uglify');
            if (options.semi === false) {
                args.push('--no-semi');
            }
        }
        if (options.coverage === false) {
            args.push('--no-coverage');
        }
        if (options.istanbul) {
            args.push('--istanbul');
        }
        args.unshift(util.shifter);

        child = spawn(process.execPath, args, {
            cwd: path.join(shifter.cwd(), '../', job),
            stdio: 'inherit'
        });

        child.on('exit', stack.add(function (code) {
            log.info('build for ' + job + ' complete, downshifting');
            if (code) {
                log.err('prebuild ' + job + ' failed, exited with code ' + code + ', hitting the brakes, fix it and try again!');
            }
        }));
    });

    stack.done(function (err) {
        log.errors(err);
        if (err && err.length) {
            return callback('prebuild failed, hitting the brakes, fix it and try again!');
        }
        callback();
    });
};

exports.start = function (json, options, buildCallback) {
    log.info('putting the hammer down');
    var stack = new Stack(),
        start = new Date(),
        hasSkin = false,
        buildStat,
        end = function (err) {
            var end = new Date();
            log.info('done racing, the gears are toast');
            log.info('finished in ' + timer.calc(start, end));
            if (buildCallback) {
                buildCallback(err);
            }
        },
        post = function (json, callback) {
            if (json.postbuilds && options.exec) {
                log.info('found a postbuild, shifting it');
                prebuild(json.postbuilds, options, function (err) {
                    if (err) {
                        return callback(err);
                    }

                    delete json.postbuilds;
                    post(json, callback);
                });
            } else if (json.postexec && options.exec) {
                smodule.exec(json.postexec, function () {
                    delete json.postexec;
                    post(json, callback);
                });
            } else {
                callback();
            }
        };

    if (json.prebuilds && options.exec) {
        log.info('found a prebuild, shifting it');
        prebuild(json.prebuilds, options, function (err) {
            if (err) {
                return buildCallback(err);
            }

            delete json.prebuilds;
            exports.start(json, options, buildCallback);
        });
        return;
    }

    if (json.exec && options.exec) {
        log.info('found a global exec, shifting it');
        buildStat = fs.statSync(options.buildFile);
        smodule.exec(json.exec, function () {
            delete json.exec;
            var json2,
                buildStat2 = fs.statSync(options.buildFile);
            if (buildStat2.mtime > buildStat.mtime) {
                log.warn('build.json has changed after exec, reloading..');
                try {
                    //Not using `require` here because it will be cached and we need a new copy
                    json2 = JSON.parse(fs.readFileSync(options.buildFile, 'utf8'));
                } catch (e) {
                    console.log(e.stack);
                    return buildCallback('hitting the brakes! failed to parse ' + options.buildFileName + ', syntax error?');
                }

                if (pack.valid(json2)) {
                    pack.munge(json2, options, function (err, json2, options) {
                        delete json2.exec;
                        delete json2.prebuilds;

                        if (err) {
                            return buildCallback(err);
                        }

                        exports.start(json2, options, buildCallback);
                    });
                } else {
                    buildCallback('hitting the brakes, your ' + options.buildFileName + ' file is invalid, please fix it!');
                }
            } else {
                exports.start(json, options, buildCallback);
            }
        });
        return;
    }

    if (options.modules) {
        log.info('limiting to: ' + options.modules);
    }

    hasSkin = Object.keys(json.builds).some(function (name) {
        var mod = json.builds[name];
        return (mod.skinnable || (mod.config && mod.config.skinnable));
    });

    Object.keys(json.builds).forEach(function (name) {
        var mod = json.builds[name];
        if (!mod.skinnable && !(mod.config && mod.config.skinnable) && mod.assets !== false) {
            mod.assets = !hasSkin;
        }
        if (!options.modules || has(options.modules, name)) {
            log.info('shifting into gear for ' + name);
            smodule.build(mod, name, options, stack.add(noop));
        }
    });

    stack.done(function (err) {
        log.errors(err);
        if (err && err.length) {
            return end('build failed, hitting the brakes, fix it and try again!');
        }
        var rollups = [];
        if (json.rollups) {
            log.info('build has rollup builds, shifting them now');
            Object.keys(json.rollups).forEach(function (name) {
                var mod = json.rollups[name];
                if (!options.modules || has(options.modules, name)) {
                    log.info('shifting into gear for ' + name);
                    mod.buildDir = options['build-dir'];
                    rollups.push({
                        mod: mod,
                        name: name,
                        options: options
                    });
                }
            });
            smodule.rollup(rollups, function () {
                post(json, end);
            });
        } else {
            post(json, end);
        }

    });
};
