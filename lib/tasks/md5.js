/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var crypto = require('crypto'),
    fs = require('fs'),
    log = require('../log'),
    exists = require('../util').exists;

exports.md5check = function (options, blob, done) {
    var md5sum,
        md5,
        md5sumCurrent,
        md5Current,
        err = null,
        current = options.current,
        end = function () {
            if (!options.error && err) {
                err = null;
            }
            done(err, new blob.constructor(blob.result, blob));
        };

    exists(current, function (yes) {
        if (yes) {
            //File exists, check it's md5 before processing
            fs.readFile(current, 'utf8', function (readErr, data) {
                if (readErr) {
                    end(); //Continue Build
                } else {
                    md5sum = crypto.createHash('md5');
                    md5sum.update(blob.result.trim());
                    md5 = md5sum.digest('hex');

                    md5sumCurrent = crypto.createHash('md5');
                    md5sumCurrent.update(data.trim());
                    md5Current = md5sumCurrent.digest('hex');
                    //log.log('current: ' + md5Current);
                    //log.log('processing: ' + md5);
                    if (md5 === md5Current) {
                        err = 'file has not changed, bailing the build';
                    } else {
                        log.log('file has changed, continuing build');
                    }
                    end();
                }
            });
        } else {
            end(); //Continue Build
        }
    });
};

