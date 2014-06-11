/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var cssproc = require('cssproc');

exports.cssproc = function (options, blob, done) {

    if (options.url) {
        cssproc.parse({
            root: options.root,
            path: options.file,
            base: options.url
        }, blob.result, function(err, str) {
            done(null, new blob.constructor(str, blob));
        });
    } else {
        done(null, new blob.constructor(blob.result, blob));
    }

};
