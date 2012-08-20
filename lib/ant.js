/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var log = require('./log'),
    path = require('path'),
    pack = require('./pack'),
    fs = require('fs');

log.info('looking for ant files');


var hasRollups;

var json = {
    name: path.basename(process.cwd()),
    builds: {}
};

var parse = function(files, callback) {
    if (!files.length) {
        return callback(json);
    }
    var file = files.pop();
    log.info('parsing ' + file);
    fs.readFile(path.join(process.cwd(), file), 'utf8',function(err, content) {
        if (err) {
            log.err(err);
        }
        
        content = content.replace(/\\\n/g, '');
        content = content.split('\n').sort().reverse();
        var data = {};
        content.forEach(function(line) {
            if (line.indexOf('#') !== 0 && line.length) {
                var values = line.split('=');
                var key = values.shift().replace('component.', '');
                switch (key) {
                    case 'component':
                        data.name = values[0];
                        break;
                    case 'appendfiles':
                    case 'prependfiles':
                    case 'jsfiles':
                    case 'cssfiles':
                        data[key] = values[0].replace(/ /g, '').trim().split(',')
                        break;
                    case 'rollup.modules.buildfiles':
                        hasRollups = true;
                        json[pack.bad] = true;
                        data.rollup = values[0].replace(/ /g, '').trim().split(',')
                        break;
                    case 'basefilename':
                        data[key] = values[0];
                        break;
                    case 'logger.regex':
                        data.regex = values[0];
                        break;
                    // get from ./meta/*.json
                    case 'skinnable':
                    case 'requires':
                    case 'optional':
                    case 'supersedes':
                    case 'use':
                    case 'lang':
                    case 'after':
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
                            var parts = key.split('.');
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
            var name = data.name;
            delete data.name;
            json.builds[name] = data;
        }
        parse(files, callback);
    });
};



exports.process = function(callback) {
    fs.readdir(process.cwd(), function(err, files) {
        if (err) {
            log.err(err);
        }
        var props = [];
        files.forEach(function(file) {
            if (path.extname(file) === '.properties') {
                props.push(file);
            }
        });

        if (props.length) {
            log.info('found ' + props.length + ' .properties files, upshifting to convert');
            parse(props, function(data) {
                log.info('saving newly parsed build.json file for ' + data.name);
                fs.writeFile(path.join(process.cwd(), 'build.json'), JSON.stringify(data, null, 4) + '\n', 'utf8');
                if (hasRollups) {
                    log.warn('i think we dropped the clutch! we found a rollup config that we can\'t parse');
                    log.warn('you need to inspect the build.json file and fix the relationships yourself');
                    log.warn('IF YOU DON\'T FIX THEM THIS BUILD WILL BLOW THE TRANSMISSION AND THAT\'S NOT GOOD');
                } else {
                    callback();
                }
            });
        } else {
            log.error('no .properties files located, hit the brakes');
        }

    });

};

