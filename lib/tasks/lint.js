/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var linter = require('jslint/lib/linter');

exports.lint = function(options, blob, done) {
    options = options || {}; 

    var result = linter.lint(blob.result, options),
        linted = result.errors ? new blob.constructor(blob, { lint: result.errors }) : blob;


    done(options.callback ? options.callback(linted) : null, linted);
};
