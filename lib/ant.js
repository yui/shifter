/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var log = require('./log'),
    path = require('path'),
    pack = require('./pack'),
    shifter = require('./index'),
    fs = require('fs');

log.info('looking for ant files');


var hasRollups;

var json = {
    name: path.basename(shifter.cwd()),
    builds: {}
};

var parse = function (files, callback) {
    if (!files.length) {
        return callback(json);
    }
    var file = files.pop();
    log.info('parsing ' + file);
    fs.readFile(path.join(shifter.cwd(), file), 'utf8', function (err, content) {
        var data = {}, name;
        if (err) {
            log.err(err);
        }
        content = content.replace(/\\\n/g, '');
        content = content.split('\n').sort().reverse();
        content.forEach(function (line) {
            /*jslint white: true */
            //I totally don't agree with jslint on this one..
            if (line.indexOf('#') !== 0 && line.length) {
                var values = line.split('='),
                    key = values.shift().replace('component.', ''),
                    parts;
                switch (key) {
                    case 'component':
                        data.name = values[0];
                        break;
                    case 'appendfiles':
                    case 'prependfiles':
                    case 'jsfiles':
                    case 'cssfiles':
                        data[key] = values[0].replace(/ /g, '').trim().split(',');
                        break;
                    case 'rollup.modules.buildfiles':
                        hasRollups = true;
                        json[pack.bad] = true;
                        data.rollup = values[0].replace(/ /g, '').trim().split(',');
                        break;
                    case 'basefilename':
                        data[key] = values[0];
                        break;
                    case 'logger.regex':
                        data.regex = values[0];
                        break;
                    case 'skinnable':
                        data.config = data.config || {};
                        data.skinnable = values[0];
                        data.config.skinnable = values[0];
                        break;
                    case 'requires':
                    case 'optional':
                    case 'supersedes':
                    case 'use':
                    case 'lang':
                    case 'after':
                        data.config = data.config || {};
                        data.config[key] = values[0].replace(/ /g, '').trim().split(',');
                        break;
                    // get from ./meta/*.json
                    // end meta
                    case 'builddir':
                    case 'srcdir':
                    case 'rollup':
                    case 'tests.requires':
                    case 'global.src.component':
                    case 'global.build.component':
                        //ignore
                        break;
                    default:
                        data.meta = data.meta || {};
                        if (key.indexOf('.') > -1) {
                            parts = key.split('.');
                            data.meta[parts[0]] = data.meta[parts[0]] || {};
                            data.meta[parts[0]][parts[1]] = (values.length > 1) ? values : values[0];
                        } else {
                            data.meta[key] = (values.length > 1) ? values : values[0];
                        }
                        break;
                }
            }
        });
        if (Object.keys(data).length && data.name) {
            name = data.name;
            delete data.name;
            json.builds[name] = data;
        }
        parse(files, callback);
    });
};



exports.process = function (options, callback) {
    fs.readdir(shifter.cwd(), function (err, files) {
        if (err) {
            log.err(err);
        }
        var props = [];
        files.forEach(function (file) {
            if (path.extname(file) === '.properties') {
                props.push(file);
            }
        });

        if (props.length) {
            log.info('found ' + props.length + ' .properties files, upshifting to convert');
            parse(props, function (data) {
                var fileName = (options.config ? path.basename(options.config) : 'build.json');
                log.info('saving newly parsed ' + fileName + ' file for ' + data.name);
                fs.writeFile(path.join(shifter.cwd(), fileName), JSON.stringify(data, null, 4) + '\n', 'utf8');
                if (hasRollups) {
                    log.err('i think we dropped the clutch! we found a rollup config that we can\'t parse');
                    log.err('you need to inspect the ' + fileName + ' file and fix the relationships yourself');
                    log.err('IF YOU DON\'T FIX THEM THIS BUILD WILL BLOW THE TRANSMISSION AND THAT\'S NOT GOOD');
                    log.err('YOU MUST MANUALLY FIX THIS, SHIFTER WILL NOT CONVERT ROLLUPS!!');
                } else {
                    callback();
                }
            });
        } else {
            callback('no .properties files located, hit the brakes');
        }

    });

};

