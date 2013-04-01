var log = require('./log'),
    watch = require('watch'),
    path = require('path'),
    shifter = require('./'),
    util = require('./util'),
    timer = require('timethat'),
    walk = require('walkdir'),
    dirs = [
        'assets',
        'css',
        'js',
        'meta'
    ],
    spawn = require('child_process').spawn,
    quiet = false,
    buildRunning = false,
    buildArgs = [],
    usableExts = {
        '.js': true,
        '.css': true,
        '.json': true
    };

var build = function (cwd, callback) {
    if (buildRunning) {
        log.warn('change detected while a build is in progress, you\'re too fast for me');
        return false;
    }
    buildArgs.unshift(util.shifter);


    var stds = [process.stdin, process.stdout, process.stderr], child, start = new Date();

    if (quiet) {
        buildArgs.push('--quiet');
    }

    child = spawn(process.execPath, buildArgs, {
        cwd: cwd,
        stdio: stds
    });

    buildRunning = true;
    
    child.on('exit', function (code) {
        buildRunning = false;
        var end = new Date();
        log.info('finished in ' + timer.calc(start, end) + ', pretty fast huh?');
        if (code) {
            log.err('build failed, try again..');
            if (quiet) {
                log.err('try it without --quiet next time');
            }
        } else {
            log.info('build exited with ' + code + ' you are good to go');
            log.info('finished at ' + new Date());
        }
        if (callback) {
            callback();
        }
    });
};

var changed = function (curr, prev) {
    var ret = false;
    if ((curr && prev) && curr.size !== prev.size) {
        ret = true;
    }

    if ((curr && !prev) || (!curr && prev)) { //new file or removed file
        ret = true;
    }

    if (curr && prev && (curr.mtime > prev.mtime)) {
        ret = true;
    }

    return ret;
};

var shorten = function (file) {
    return file.replace(shifter.cwd(), '.');
};

var handler = function (file, curr, prev) {
    var ext = path.extname(file),
        dir = path.dirname(file),
        name = shorten(file);

    if (usableExts[ext]) {
        if (changed(curr, prev)) {
            util.find(dir, 'build.json', function(err, json) {
                if (json) {
                    log.info(name + ' changed, shifting');
                    var dir = path.dirname(json);
                    if (name.indexOf('./meta') === 0) {
                        log.info('meta changed, shifting yui');
                        build(path.join(dir, '../yui'));
                    } else {
                        log.info('shifting here: ' + dir);
                        build(dir);
                    }
                }
           });
        }
    }
};

var scan = function(options) {
    log.info('no build.json file found, racing to see if we can find one');
    var finder = walk(shifter.cwd()),
        mods = [];

    finder.on('file', function(file) {
        if (path.basename(file) === 'build.json') {
            mods.push(path.basename(path.dirname(file)));
        }
    });

    finder.on('end', function() {
        if (mods.length) {
            log.info('racing complete, found ' + mods.length + ' modules to watch! you may code now, i\'ll build them when they change');
            //log.info('modules: ' + mods.join(', '));
            options.modules = mods;
            exports.start(options);
        } else {
            log.bail('failed to locate any build.json files under this directory');
        }
    });
};

exports.start = function (options) {
    quiet = true;
    var start = function() {
        log.info('watching for shifts in ' + dirs.join(', '));

        quiet = options.quiet;
        if (quiet) {
            log.warn('shifting into quiet mode, only errors will be printed');
        }

        var args = require('./args').raw();
        args.argv.original.forEach(function (arg) {
            if (arg !== '--watch') {
                buildArgs.push(arg);
            }
        });

        watch.createMonitor(shifter.cwd(), {
            ignoreDotFiles: true,
            filter: function (file) {
                var name = shorten(file),
                    inDirs = dirs.some(function (d) {
                        return (name.indexOf('./' + d) === 0) || name === d;
                    });
                if (inDirs) {
                    return false;
                }
            }
        }, function (monitor) {
            log.info('waiting for a gear to shift...\n');
            ['created', 'changed', 'updated'].forEach(function (event) {
                monitor.on(event, handler);
            });
        });
    };
    
    if (!options.modules) {
        if (!util.existsSync(path.join(shifter.cwd(), 'build.json'))) {
            return scan(options);
        }
        log.info('shifting the first time for you..');
        build(shifter.cwd(), start);
    } else {
        start();
    }

    
};
