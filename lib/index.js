/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var log = require('./log'),
    fs = require('fs'),
    vm = require('vm'),
    path = require('path'),
    pack = require('./pack'),
    args = require('./args'),
    util = require('./util'),
    find = util.find,
    CWD = process.cwd(),
    queue = [],
    buildRunning = false,
    exists = util.exists,
    contextForRunInContext = vm.createContext({
        require: require,
        module: require('module'),
        console: {
            log: function () {}
        },
        window: {},
        document: {}
    });

exports.cwd = function() {
    return CWD;
};

var runQueue = function() {
    if (!buildRunning) {
        var item = queue.pop();
        if (item) {
            buildRunning = true;
            exports.init(item.opts, function(err) {
                buildRunning = false;
                if (err) {
                    return item.callback(err);
                }
                item.callback();
                runQueue();
            });
        }
    }
};

function logAndExit(err) {
    if (err) {
        log.err(err);
        process.exit(1);
    }
}

exports.add = function(opts, callback) {
    queue.push({
        opts: opts,
        callback: callback || logAndExit
    });
    runQueue();
};

exports.init = function (opts, initCallback) {
    var options = args.defaults(opts),
        watch,
        buildFile = options.config,
        buildFileName;

    log.reset(options);

    if (!initCallback) {
        initCallback = logAndExit;
    }

    if (options.cwd) {
        CWD = options.cwd;
    }

    if (!buildFile) {
        buildFile = options['yui-module'] ? options['yui-module'] : path.join(CWD, 'build.json');
    }

    buildRunning = true;

    buildFileName = path.basename(buildFile);

    options.buildFile = buildFile;
    options.buildFileName = buildFileName;
    if (!options.recursive) {
        // The build-dir should not be relative to cwd if running recursively.
        options['build-dir'] = path.resolve(exports.cwd(), options['build-dir']);
    }

    if (options.version || options.help) {
        require('./help');
        return;
    }

    if (options.quiet) {
        log.quiet();
    }

    if (options.silent) {
        log.silent();
    }

    if (options['global-config']) {
        log.info('racing to find the closest .shifter.json file');
        find(CWD, '.shifter.json', function(err, file) {
            if (file) {
                log.info('woohoo, found a config here: ' + file);

                var json = JSON.parse(fs.readFileSync(file, 'utf8'));
                Object.keys(json).forEach(function(key) {
                    if (!args.has(key)) {
                        log.info('override config found for ' + key);
                        options[key] = json[key];

                        // Special case to determine whether we should resolve
                        // the build directory relative to the global config.
                        if (key === 'build-dir') {
                            options['build-dir'] = path.resolve(path.dirname(file), json[key]);
                        }
                    }
                });
            }
        });
    }

    if (options.watch) {
        watch = require('./watch');
        watch.start(options);
        return;
    }

    log.info('revving up');
    if (!options.walk) {
        log.info('looking for ' + buildFileName + ' file');
    }

    exists(buildFile, function (yes) {
        var json, walk, ant, mods, builder;
        if (yes) {
            if (options.ant) {
                return initCallback('already has a ' + buildFileName + ' file, hitting the brakes');
            }
            log.info('found ' + buildFileName + ' file, shifting');
            if (path.extname(buildFileName) === '.json') {
                try {
                    json = require(buildFile);
                } catch (e) {
                    console.log(e.stack);
                    return initCallback('hitting the brakes! failed to parse ' + buildFileName + ', syntax error?');
                }
                if (pack.valid(json)) {
                    log.info('putting the hammer down, let\'s build this thing!');
                    pack.munge(json, options, function (err, json, options) {
                        if (err) {
                            return initCallback(err);
                        }

                        if (options.list) {
                            mods = Object.keys(json.builds).sort();
                            log.info('This module includes these builds:');
                            console.log(mods.join(', '));
                            if (json.rollups) {
                                log.info('and these rollups');
                                console.log(Object.keys(json.rollups).join(', '));
                            }
                        } else {
                            builder = require('./builder');
                            builder.reset();
                            builder.start(json, options, function(err) {
                                buildRunning = false;
                                initCallback(err);
                            });
                        }
                    });
                } else {
                    return initCallback('hitting the brakes, your ' + buildFileName + ' file is invalid, please fix it!');
                }
            } else if (path.extname(buildFileName) === '.js') {
                // probably a row module
                contextForRunInContext.YUI = {
                    add: function (name, fn, version, config) {
                        mods = mods || {};
                        mods[name] = {
                            yuifile: buildFile,
                            config: config || {}
                        };
                    }
                };
                try {
                    vm.runInContext(fs.readFileSync(buildFile, 'utf8'),
                            contextForRunInContext, buildFile);
                } catch (e) {
                    return initCallback('hitting the brakes, your ' + buildFileName + ' file is invalid, please fix it!');
                }
                if (mods) {
                    // raw yui module without build.json
                    builder = require('./builder');
                    builder.reset();
                    builder.start({
                        builds: mods
                    }, options, function(err) {
                        buildRunning = false;
                        initCallback(err);
                    });
                }
            } else {
                return initCallback('hitting the brakes, your ' + buildFileName + ' file is invalid, please fix it!');
            }
        } else {
            if (options.walk) {
                walk = require('./walk');
                // Use the less-processed opts here instead - we don't want the defaults to override the individual
                // Shifter configurations.
                walk.run(args.baseOptions(opts), initCallback);
            } else {
                log.warn('no ' + buildFileName + ' file, downshifting to convert ant files');
                ant = require('./ant');
                ant.process(options, function (err) {
                    if (err) {
                        return initCallback(err);
                    }

                    if (!options.ant) {
                        exports.init(options, initCallback);
                    }
                });
            }
        }
    });
};
