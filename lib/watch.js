var log = require('./log'),
    watch = require('watch'),
    path = require('path'),
    fs = require('fs'),
    which = require('which').sync,
    timer = require('./timer'),
    dirs = [
        'assets',
        'css',
        'js',
        'meta'
    ],
    spawn = require('child_process').spawn,
    exists = fs.exists || path.exists,
    quiet = false,
    buildRunning = false,
    buildArgs = [],
    usableExts = {
        '.js': true,
        '.css': true,
        '.json': true
    };

var build = function (cwd) {
    if (buildRunning) {
        log.warn('change detected while a build is in progress, you\'re too fast for me');
        return false;
    }
    var child = spawn(which('shifter'), buildArgs, {
        cwd: cwd
    }), start = new Date();

    buildRunning = true;

    if (!quiet) {
        child.stdout.on('data', function (data) {
            console.log(data.toString().trim());
        });
    }
    child.stderr.on('data', function (data) {
        log.err(data.toString());
    });
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
        }
    });
};

var changed = function (curr, prev) {
    var ret = false;
    if ((curr && prev) && curr.size !== prev.size) {
        ret = true;
    }
    return ret;
};

var shorten = function (file) {
    return file.replace(process.cwd(), '.');
};

var handler = function (file, curr, prev) {
    var ext = path.extname(file),
        name = shorten(file);

    if (usableExts[ext]) {
        if (changed(curr, prev)) {
            log.info(name + ' changed, shifting');
            if (name.indexOf('./meta') === 0) {
                log.info('meta changed, shifting loader');
                build(path.join(process.cwd(), '../loader'));
            } else {
                log.info('shifting here');
                build(process.cwd());
            }
        }
    }
};

exports.start = function (options) {
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

    watch.createMonitor(process.cwd(), {
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
        log.info('waiting for a gear to shift...');
        ['created', 'changed', 'updated'].forEach(function (event) {
            monitor.on(event, handler);
        });
    });
};
