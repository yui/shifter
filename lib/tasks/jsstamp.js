/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

exports.jsstamp = function(options, blob, done) {
    options = options || {};

    options.prefix = options.prefix || '';
    options.postfix = options.postfix || '';

    var result = options.prefix + blob.result + options.postfix;

    done(null, new blob.constructor(result, blob));
};
