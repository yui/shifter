/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var coverage = require('yuitest-coverage');

exports.coverage = function (options, blob, done) {
    options = options || {}; //Not needed here??

    coverage.cover(blob.result, options, function (err, data) {
        if (err) {
            done(err);
        } else {
            done(null, new blob.constructor(data, blob));
        }
    });
};
