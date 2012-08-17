var log = require('./log'),
    fs = require('fs'),
    path = require('path'),
    pack = require('./pack'),
    builder = require('./builder'),
    exists = fs.exists || path.exists;


exports.init = function() {
    log.info('revving up');
    log.info('looking for build.json file');
    var buildFile = path.join(process.cwd(), 'build.json');
    exists(buildFile, function(yes) {
        if (yes) {
            log.info('found build.json file, shifting');
            var json = require(buildFile);
            if (pack.valid(json)) {
                log.info('putting the hammer down, let\'s build this thing!');
                pack.munge(json, builder.start);
            } else {
                log.error('hitting the brakes, your build.json file is invalid, please fix it!');
            }
        } else {
            log.warn('no build.json file, downshifting to convert ant files');
            var ant = require('./ant');
            ant.process(function() {
                exports.init();
            });
        }
    });
};
