/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var yuglify = require('yuglify');

exports.cssmin = function (options, blob, done) {
    yuglify.cssmin(blob.result, function(err, smashed) {
        done(null, new blob.constructor(smashed, blob));
    });
};
