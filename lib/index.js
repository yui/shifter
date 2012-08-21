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


exports.init = function() {
    var options = args.parse();

    if (options.version || options.help) {
        require('./help');
    }

    log.info('revving up');
    if (!options.walk) {
        log.info('looking for build.json file');
    }
    var buildFile = path.join(process.cwd(), 'build.json');
    exists(buildFile, function(yes) {
        if (yes) {
            log.info('found build.json file, shifting');
            try {
            var json = require(buildFile);
            } catch (e) {
                console.log(e.stack);
                log.error('hitting the brakes! failed to parse build.json, syntax error?');
            }
            if (pack.valid(json)) {
                log.info('putting the hammer down, let\'s build this thing!');
                pack.munge(json, function() {
                    builder.start(json, options);
                });
            } else {
                log.error('hitting the brakes, your build.json file is invalid, please fix it!');
            }
        } else {
            if (options.walk) {
                var walk = require('./walk');
                walk.run(options);
            } else {
                log.warn('no build.json file, downshifting to convert ant files');
                var ant = require('./ant');
                ant.process(function() {
                    exports.init();
                });
            }
        }
    });
};
