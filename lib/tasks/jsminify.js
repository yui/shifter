/*
 * Copyright (c) 2011-2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
var yuglify = require('yuglify');

var yuglifyConfig = {
    ie8: true,
    mangle: true,
    output: {
      semicolons: true,
      max_line_len: 6000,
      comments: /^!/,
    },
    compress: {
      hoist_vars: true,
    }
};

/**
 * Minify JS.
 *
 * @param options {Object} Task options.
 * @param options.config {Object} Minify options.
 * @param blob {Object} Incoming blob.
 * @param done {Function} Callback on task completion.
 */
exports.jsminify = function (options, blob, done) {
    yuglify.jsmin(blob.result, yuglifyConfig, function(err, smashed) {
        if (err) {
            if (options.callback) {
                options.callback(err);
            }
            done('Minify failed, ' + (blob.name || 'file') + ' unparseable');
        } else {
            done(null, new blob.constructor(smashed, blob));
        }
    });
};
