/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var cssmin = require('cssmin').cssmin;

exports.cssmin = function (options, blob, done) {
    var result = cssmin(blob.result);
    done(null, new blob.constructor(result, blob));
};

