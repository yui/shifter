/*jslint stupid: true */
/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var path = require('path'),
    fs = require('fs'),
    log = require('./log'),
    args = require('./args'),
    exists = fs.exists || path.exists;

exports.bad = 'BAD_FILE_REMOVE_WHEN_FIXED';

exports.valid = function (json) {
    return !(json[exports.bad]);
};

var flatten = function (json) {
    var i,
        walker = function (l) {
            var m, o;
            if (json[i][l]) {
                m = flatten(json[i][l]);
                delete json[i][l];
                for (o in m) {
                    if (m.hasOwnProperty(o)) {
                        json[o] = flatten(m[o]);
                    }
                }
            }
        };
    for (i in json) {
        if (json.hasOwnProperty(i)) {
            ['submodules', 'plugins'].forEach(walker);
            delete json.condition;
        }
    }

    return json;
};

var mix = function (s, r) {
    var i;
    r = r || {};
    for (i in s) {
        if (s.hasOwnProperty(i)) {
            r[i] = s[i];
        }
    }
    return r;
};

exports.munge = function (json, options, callback) {
    var meta = path.join(process.cwd(), 'meta');

    exists(meta, function (yes) {
        if (yes) {
            var files = fs.readdirSync(meta), mod;
            files.forEach(function (file) {
                if (path.extname(file) === '.json') {
                    log.info('munging in loader meta data into build.json');
                    try {
                        mod = flatten(require(path.join(meta, file)));
                    } catch (e) {
                        console.log(e.stack);
                        log.error('hitting the brakes! failed to parse ' + file + ', syntax error?');
                    }
                    Object.keys(json.builds).forEach(function (name) {
                        if (mod[name]) {
                            json.builds[name].config = mix(mod[name], json.builds[name].config);
                        }
                    });
                    if (json.rollups) {
                        Object.keys(json.rollups).forEach(function (name) {
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
        Object.keys(json.builds).forEach(function (name) {
            json.builds[name].config = json.builds[name].config || {};
        });

        if (json.shifter) {
            Object.keys(json.shifter).forEach(function (a) {
                if (!args.has(a)) {
                    log.info('override config found for ' + a);
                    options[a] = json.shifter[a];
                }
            });
        }

        callback(json, options);
    });

};
