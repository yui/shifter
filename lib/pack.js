/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var path = require('path'),
    fs = require('fs'),
    log = require('./log'),
    args = require('./args'),
    shifter = require('./index'),
    exists = require('./util').exists,
    existsSync = require('./util').existsSync;

exports.bad = 'BAD_FILE_REMOVE_WHEN_FIXED';

exports.valid = function (json) {
    return !(json[exports.bad]);
};

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

    exists(meta, function (hasMeta) {
        var files, mod;
        if (hasMeta) {
            files = fs.readdirSync(meta);
            files.forEach(function (file) {
                if (path.extname(file) === '.json') {
                    log.info('munging in loader meta data into build.json');
                    try {
                        mod = flatten(require(path.join(meta, file)));
                    } catch (e) {
                        console.log(e.stack);
                        log.error('hitting the brakes! failed to parse ' + file + ', syntax error?');
                        return;
                    }
                    Object.keys(json.builds).forEach(function (name) {
                        if (mod[name]) {
                            json.builds[name].config = mix(mod[name], json.builds[name].config);
                            if (json.builds[name].config && json.builds[name].config.skinnable) {
                                log.info(name + ' is skinnable, locating all available skins');
                                var skins = path.join(shifter.cwd(), 'assets', 'skins'),
                                    subSkin = path.join(shifter.cwd(), 'assets', name, 'skins'),
                                    dirs;
                                
                                //Wipe what we know about skins and reset them
                                if (options['dynamic-skins']) {
                                    json.builds[name].config.skins = [];
                                    mod[name].skins = [];
                                }
                                json.builds[name].skins = {};

                                if (existsSync(subSkin)) {
                                    skins = subSkin;
                                }
                                if (existsSync(skins)) {
                                    dirs = fs.readdirSync(skins);
                                    dirs.forEach(function(skin) {
                                        if (skin.indexOf('.') === 0) {
                                            return;
                                        }
                                        var stat = fs.statSync(path.join(skins, skin));
                                        if (stat.isDirectory()) {
                                            if (options['dynamic-skins']) {
                                                json.builds[name].config.skins.push(skin);
                                                mod[name].skins.push(skin);
                                            }
                                            json.builds[name].skins[skin] = path.join(skins, skin);
                                        }
                                    });
                                }
                                if (options['global-skins-dir']) {
                                    if (existsSync(options['global-skins-dir'])) {
                                        skins = path.join(options['global-skins-dir'], name, 'skins');
                                        if (existsSync(skins)) {
                                            dirs = fs.readdirSync(skins);
                                            dirs.forEach(function(skin) {
                                                if (skin.indexOf('.') === 0) {
                                                    return;
                                                }
                                                var stat = fs.statSync(path.join(skins, skin));
                                                if (stat.isDirectory()) {
                                                    json.builds[name].skins[skin] = path.join(skins, skin);
                                                    if (options['dynamic-skins']) {
                                                        json.builds[name].config.skins.push(skin);
                                                        mod[name].skins.push(skin);
                                                    }
                                                }
                                            });
                                        }
                                    } else {
                                        log.bail('failed to find global-skin-dir: ' + options['global-skins-dir']);
                                    }
                                }
                            }
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


        //console.log(JSON.stringify(json.builds, null, 4));
        //process.exit(1);

        callback(json, options);
    });

};
