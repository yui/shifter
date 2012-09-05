
var log = require('./log'),
    Stack = require('./stack').Stack,
    timer = require('./timer'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    exists = fs.exists || path.exists,
    which = require('which').sync,
    has = function (opt, name) {
        return opt.some(function (v) {
            return (v === name);
        });
    };

exports.run = function (options) {
    log.info('racing the directories');
    var modStack = new Stack(),
        start = new Date(),
        mods = [],
        args = [];

    if (options.compressor) {
        args.push('--compressor');
    }
    if (options.semi === false) {
        args.push('--no-semi');
    }
    if (options.coverage === false) {
        args.push('--no-coverage');
    }

    if (args.length) {
        log.info('using ' + args.join(' '));
    }

    fs.readdir(process.cwd(), modStack.add(function (err, dirs) {
        dirs.forEach(function (mod) {
            var p = path.join(process.cwd(), mod);
            exists(path.join(p, 'build.json'), modStack.add(function (yes) {
                if (yes) {
                    if (!options.modules || has(options.modules, mod)) {
                        mods.push(mod);
                    }
                } else {
                    exists(path.join(p, 'build.xml'), modStack.add(function (yes) {
                        if (yes) {
                            if (!options.modules || has(options.modules, mod)) {
                                mods.push(mod);
                            }
                        }
                    }));
                }
            }));
        });
    }));

    modStack.done(function () {
        if (!mods.length) {
            log.error('no modules found, hitting the brakes.');
        }
        log.info('found ' + mods.length + ' modules to race, let\'s do this');
        log.warn('this will be quiet, only status will be emitted for speed. failed builds will print after');
        var stack = new Stack(),
            errors = [],
            run = function () {
                var mod = mods.pop(), child;
                if (mod) {
                    child = spawn(which('shifter'), args, {
                        cwd: path.join(process.cwd(), mod),
                        stdio: ['ignore', 'ignore', process.stderr]
                    });
                    child.on('exit', stack.add(function (code) {
                        process.stdout.write((code ? '!'.red : '.'.white));
                        if (code) {
                            errors.push(mod);
                        }
                        run();
                    }));
                }
            };

        run();

        stack.done(function () {
            console.log('');
            var end = new Date();
            log.info('done racing, the gears are toast');
            log.info('finished in ' + timer.calc(start, end) + ', pretty fast huh?');
            if (errors.length) {
                log.warn('the following builds exited with a 1');
                console.log(errors.join(', '));
            }
        });
    });
};
