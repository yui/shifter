/*
 * Copyright (c) 2011-2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
var yuglify = require('yuglify');

/**
 * Minify JS.
 *
 * @param options {Object} Task options.
 * @param options.config {Object} Minify options.
 * @param blob {Object} Incoming blob.
 * @param done {Function} Callback on task completion.
 */
exports.jsminify = function (options, blob, done) {
    //Using the default config
    yuglify.jsmin(blob.result, function(err, smashed) {
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
