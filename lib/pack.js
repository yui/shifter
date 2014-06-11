/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
//We are looping data, no need for this
/*jshint forin: false */
var path = require('path'),
    fs = require('fs'),
    log = require('./log'),
    args = require('./args'),
    shifter = require('./index'),
    exists = require('./util').exists;

exports.bad = 'BAD_FILE_REMOVE_WHEN_FIXED';

exports.valid = function (json) {
    return !(json[exports.bad]);
};

/*jshint forin: false */
var flatten = function (json) {
    var walker = function (i) {
        return function (l) {
            var m, o;
            if (json[i][l]) {
                m = flatten(json[i][l]);
                delete json[i][l];
                for (o in m) {
                    json[o] = flatten(m[o]);
                }
            }
        };
    }, item;
    for (item in json) {
        ['submodules', 'plugins'].forEach(walker(item));
        delete json[item].condition;
        delete json.condition;
    }

    return json;
};

var mix = function (s, r) {
    var i;
    r = r || {};
    for (i in s) {
        r[i] = s[i];
    }
    return r;
};

exports.munge = function (json, options, callback) {
    var meta = path.join(shifter.cwd(), 'meta');

    exists(meta, function (yes) {
        if (yes) {
            var files = fs.readdirSync(meta), mod, i, processFile;

            processFile = function(file) {
                if (path.extname(file) === '.json') {
                    log.info('munging in loader meta data into build.json');
                    mod = flatten(require(path.join(meta, file)));
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
            };

            for (i = 0; i < files.length; i += 1) {
                try {
                    processFile(files[i]);
                } catch (e) {
                    console.log(e.stack);
                    return callback('hitting the brakes! failed to parse ' + files[i] + ', syntax error?');
                }
            }
        } else {
            log.info('down shifting, can\'t find a meta directory');
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

        callback(null, json, options);
    });

};
