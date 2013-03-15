
var log = require('./log'),
    Stack = require('./stack').Stack,
    timer = require('timethat'),
    fs = require('fs'),
    path = require('path'),
    vm = require('vm'),
    shifter = require('./'),
    spawn = require('child_process').spawn,
    util = require('./util'),
    exists = util.exists,
    has = function (opt, name) {
        return opt.some(function (v) {
            return (v === name);
        });
    },
    contextForRunInContext = vm.createContext({
        require: require,
        module: require('module'),
        console: {
            log: function () {}
        },
        window: {},
        document: {}
    });

exports.run = function (options, callback) {
    if (!log.isTTY) {
        options.progress = false;
    }
    log.info('racing the directories');
    var modStack = new Stack(),
        start = new Date(),
        mods = [],
        max = options.max || false,
        bar,
        ProgressBar,
        i,
        args = [],
        checkDirectory;

    if (options.progress) {
        ProgressBar = require('progress'),
        bar = new ProgressBar(log.color('  shifting [', 'magenta') +
        log.color(':bar', 'cyan') + log.color(']', 'magenta') +
        log.color(' :percent :etas', 'yellow'), {
            total: 100,
            width: 100,
            complete: '>',
            incomplete: ' '
        });
    }
    if (options.cssproc) {
        args.push('--cssproc');
        args.push(options.cssproc);
    }
    if (options.compressor) {
        args.push('--compressor');
    }
    if (options.semi === false) {
        args.push('--no-semi');
    }
    if (options.coverage === false) {
        args.push('--no-coverage');
    }
    if (options.cache) {
        args.push('--cache');
    }
    if (options.istanbul) {
        args.push('--istanbul');
    }
    if (options.lint) {
        args.push('--lint');
        args.push(options.lint);
    }
    if (options.lint === false) {
        args.push('--no-lint');
    }
    if (options.csslint === false) {
        args.push('--no-csslint');
    }
    if (options['lint-stderr']) {
        args.push('--lint-stderr');
    }
    if (options.strict) {
        args.push('--strict');
    }

    if (options['build-dir']) {
        args.push('--build-dir');
        args.push(options['build-dir']);
    }

    Object.keys(options).forEach(function (k) {
        if (k.indexOf('replace-') === 0) {
            args.push('--' + k + '=' + options[k]);
        }
    });

    if (args.length) {
        log.info('using ' + args.join(' '));
    }

    checkYUIModule = function(path) {

        var file,
            module;

        file = fs.readFileSync(path, 'utf8');
        contextForRunInContext.YUI = {
            add: function (name, fn, version, config) {
                module = {
                    name: name,
                    yuimodule: path,
                    version: version,
                    config: config || {}
                };
            }
        };
        try {
            vm.runInContext(file, contextForRunInContext, path);
        } catch (e) {
            log.info('skipping ' + path + ', it is not a YUI module.');
        }
        return module;
    };

    checkDirectory = function(startdir, workingdir) {
        fs.readdir(workingdir, modStack.add(function (err, dirs) {
            dirs.forEach(function (mod) {
                var p = path.join(workingdir, mod);
                exists(path.join(p, 'build.json'), modStack.add(function (yes) {
                    var relative, stat, yuimodule;
                    if (yes) {
                        if (!options.modules || has(options.modules, mod)) {
                            relative = workingdir.replace(startdir, '');
                            mods.push(path.join(relative, mod));
                        }
                    } else if (options.recursive) {
                        stat = fs.statSync(p);
                        if (stat.isDirectory()) {
                            checkDirectory(startdir, p);
                        } else if (options.freestyle && '.js' === path.extname(p)) {
                            yuimodule = checkYUIModule(p);
                            if (yuimodule && (!options.modules || has(options.modules, entry.name))) {
                                relative = workingdir.replace(startdir, '');
                                yuimodule.path = path.join(relative, mod);
                                mods.push(yuimodule);
                            }
                        }
                    }
                }));
            });
        }));
    };

    checkDirectory(shifter.cwd(), shifter.cwd());

    modStack.done(function () {
        if (!mods.length) {
            log.error('no modules found, hitting the brakes.');
        }
        if (bar) {
            bar.total = mods.length - 1;
        }
        log.info('found ' + mods.length + ' modules to race' + ((max) ? ' (' + max + ' at a time)' : '') + ', let\'s do this');
        log.warn('this will be quiet, only status will be emitted for speed. failed builds will print after');
        var stack = new Stack(),
            errors = [],
            run = function () {
                var mod = mods.pop(), child, yuimodules, builder;
                if (typeof mod === 'string') {
                    // regular module with builds.json
                    args.unshift(util.shifter);
                    child = spawn(process.execPath, args, {
                        cwd: path.join(shifter.cwd(), mod),
                        stdio: [process.stdin, 'ignore', process.stderr]
                    });
                    child.on('exit', stack.add(function (code) {
                        if (options.progress) {
                            bar.tick();
                        } else {
                            process.stdout.write((code ? log.color('!', 'red') : log.color('.', 'white')));
                        }
                        if (code) {
                            errors.push(mod);
                        }
                        run();
                    }));
                } else if (mod && mod.name) {
                    // raw yui module without build.json
                    yuimodules = {};
                    yuimodules[mod.name] = mod;
                    builder = require('./builder');
                    builder.reset();
                    builder.start({
                        builds: yuimodules
                    }, options, stack.add(function() {
                        run();
                    }));
                }
            };

        if (max) {
            for (i = 0; i < max; i = i + 1) {
                run();
            }
        } else {
            run();
        }

        stack.done(function () {
            console.log('');
            var end = new Date();
            log.info('done racing, the gears are toast');
            log.info('finished in ' + timer.calc(start, end) + ', pretty fast huh?');
            if (errors.length) {
                log.warn('the following builds exited with a 1');
                errors.forEach(function (mod) {
                    console.log('   ', log.color(mod.name || mod, 'red'));
                });
                process.exit(1);
            } else if (typeof callback === 'function') {
                callback();
            }
        });
    });
};
