/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var crypto = require('crypto');

exports.md5check = function (options, blob, done) {
    var md5sum,
        md5,
        bail = null,
        callback = options.callback,
        current = options.current;

    if (typeof callback === 'function') {
        md5sum = crypto.createHash('md5');
        md5sum.update(blob.result);
        md5 = md5sum.digest('hex');
        callback(md5);
        if (md5 === current && options.error) {
            bail = 'file has not changed, bailing the build';
        }
    }

    done(bail, new blob.constructor(blob.result, blob));
};

