/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

exports.cssstamp = function (options, blob, done) {
    options = options || {};

    options.stamp = options.stamp || '';

    var result = blob.result + '\n' + options.stamp + '\n';

    done(null, new blob.constructor(result, blob));
};
