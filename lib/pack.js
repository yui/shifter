/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
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

var mix = function(s, r) {
    r = r || {};
    for (var i in s) {
        r[i] = s[i];
    }
    return r;
};

exports.munge = function(json, callback) {
    
    var meta = path.join(process.cwd(), 'meta');

    exists(meta, function(yes) {
        if (yes) {
            var files = fs.readdirSync(meta);
            files.forEach(function(file) {
                if (path.extname(file) === '.json') {
                    log.info('munging in loader meta data into build.json');
                    try {
                        var mod = flatten(require(path.join(meta, file)));
                    } catch (e) {
                        console.log(e.stack);
                        log.error('hitting the brakes! failed to parse ' + file + ', syntax error?');
                    }
                    Object.keys(json.builds).forEach(function(name) {
                        if (mod[name]) {
                            json.builds[name].config = mix(mod[name], json.builds[name].config);
                        }
                    });
                    if (json.rollups) {
                        Object.keys(json.rollups).forEach(function(name) {
                            if (mod[name]) {
                                json.rollups[name].config = mix(mod[name], json.rollups[name].config);
                            }
                        });
                    }
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
