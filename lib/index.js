/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var log = require('./log'),
    fs = require('fs'),
    path = require('path'),
    pack = require('./pack'),
    builder = require('./builder'),
    args = require('./args'),
    exists = fs.exists || path.exists;


exports.init = function () {
    var options = args.parse(),
        watch,
        buildFile = options.config || path.join(process.cwd(), 'build.json'),
        buildFileName = path.basename(buildFile);

    if (options.version || options.help) {
        require('./help');
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
        var json, walk, ant;
        if (yes) {
            if (options.ant) {
                log.error('already has a ' + buildFileName + ' file, hitting the brakes');
            }
            log.info('found ' + buildFileName + ' file, shifting');
            try {
                json = require(buildFile);
            } catch (e) {
                console.log(e.stack);
                log.error('hitting the brakes! failed to parse ' + buildFileName + ', syntax error?');
            }
            if (pack.valid(json)) {
                log.info('putting the hammer down, let\'s build this thing!');
                pack.munge(json, options, function (json, options) {
                    if (options.list) {
                        var mods = Object.keys(json.builds).sort();
                        log.info('This module includes these builds:');
                        console.log(mods.join(', '));
                        if (json.rollups) {
                            log.info('and these rollups');
                            console.log(Object.keys(json.rollups).join(', '));
                        }
                    } else {
                        builder.start(json, options);
                    }
                });
            } else {
                log.error('hitting the brakes, your ' + buildFileName + ' file is invalid, please fix it!');
            }
        } else {
            if (options.walk) {
                walk = require('./walk');
                walk.run(options);
            } else {
                log.warn('no ' + buildFileName + ' file, downshifting to convert ant files');
                ant = require('./ant');
                ant.process(options, function () {
                    if (!options.ant) {
                        exports.init();
                    }
                });
            }
        }
    });
};
