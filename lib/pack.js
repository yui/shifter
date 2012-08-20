var path = require('path'),
    fs = require('fs'),
    log = require('./log'),
    exists = fs.exists || path.exists;

exports.bad = 'BAD_FILE_REMOVE_WHEN_FIXED';

exports.valid = function(json) {
    return !(json[exports.bad]);
};

var flatten = function(json) {
    
    for (var i in json) {
        ['submodules', 'plugins'].forEach(function(l) {
            if (json[i][l]) {
                var m = flatten(json[i][l]);
                delete json[i][l];
                for (var o in m) {
                    json[o] = flatten(m[o]);
                }
            }
        });
        delete json.condition;
    }

    return json;
};

exports.munge = function(json, callback) {
    
    var meta = path.join(process.cwd(), 'meta');

    exists(meta, function(yes) {
        if (yes) {
            var files = fs.readdirSync(meta);
            files.forEach(function(file) {
                if (path.extname(file) === '.json') {
                    log.info('munging in loader meta data into build.json');
                    var mod = flatten(require(path.join(meta, file)));
                    Object.keys(json.builds).forEach(function(name) {
                        if (mod[name]) {
                            json.builds[name].config = mod[name];
                        }
                    });
                }
            });
        } else {
            log.warn('down shifting, can\'t find a meta directory');
        }
        //Cleanup..
        Object.keys(json.builds).forEach(function(name) {
            json.builds[name].config = json.builds[name].config || {};
        });
        callback(json);
    });

};
