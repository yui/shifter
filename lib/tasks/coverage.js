/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var ycoverage = require('yuitest-coverage'),
    istanbul = require('istanbul'),
    log = require('../log');

exports.coverage = function (options, blob, done) {
    options = options || {}; //Not needed here??

    var type = options.type,
        inst;
    delete options.type;

    log.info(type + ' providing coverage');

    if (type === 'yuitest') {
        ycoverage.cover(blob.result, options, function (err, data) {
            if (err) {
                done(err);
            } else {
                data = data.replace(/\r\n/g, '\n');
                done(null, new blob.constructor(data, blob));
            }
        });
    } else {
        log.log('instrumenting with istanbul');
        inst = new istanbul.Instrumenter({
            embedSource: true
        });
        inst.instrument(blob.result, options.name, function (err, data) {
            if (err) {
                done(err);
            } else {
                done(null, new blob.constructor(data, blob));
            }
        });
    }
};
