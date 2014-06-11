/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

exports.check = function (options, blob, done) {
    var bail = null;

    if (blob.result.length === 0) {
        bail = 'writing zero length file from ' + blob.name;
    }

    done(bail, new blob.constructor(blob.result, blob));
};
