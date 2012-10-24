/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var compressor = require('yuicompressor'),
    compressing = false,
    queue = [],
    running = 0,
    maxCompressor = 8,
    log = require('../log'),
    runQueue = function () {
        compressing = false;
        var item = queue.pop();
        if (item) {
            exports.compressor(item.options, item.blob, item.done);
        }
    };

exports.compressor = function (options, blob, done) {
    if (process.env.SHIFTER_COMPRESSOR_TASKS) {
        if (parseInt(process.env.SHIFTER_COMPRESSOR_TASKS, 10) > 0) {
            maxCompressor = parseInt(process.env.SHIFTER_COMPRESSOR_TASKS, 10);
        }
        log.info('found env for compressor tasks, running ' + maxCompressor + ' concurrent compressor tasks');
    }

    options = options || {};

    if (compressing && running >= maxCompressor) {
        queue.push({
            options: options,
            blob: blob,
            done: done
        });
        return;
    }

    compressing = true;
    running = running + 1;
    compressor.compress(blob.result, options, function (err, data) {
        running = running - 1;
        runQueue();
        if (err) {
            done(err);
        } else {
            done(null, new blob.constructor(data, blob));
        }
    });
};
