/*
 * Copyright (c) 2011-2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
var parser = require('uglify-js').parser,
    uglify = require('uglify-js').uglify;

/**
 * Minify JS.
 *
 * @param options {Object} Task options.
 * @param options.config {Object} Minify options.
 * @param blob {Object} Incoming blob.
 * @param done {Function} Callback on task completion.
 */
exports.jsminify = function (options, blob, done) {
    options = options || {};

    var config = options.config || {},
        ast;

    try {
        ast = parser.parse(blob.result, config.semicolon || false);

        if (config.mangle) {
            ast = uglify.ast_mangle(ast, config);
        }
        if (config.squeeze) {
            ast = uglify.ast_squeeze(ast, config);
        }

        done(null, new blob.constructor(uglify.gen_code(ast, config), blob));
    } catch (e) {
        if (options.callback) {
            options.callback(e);
        } else {
            /*jslint nomen: true */
            this._log(e);
        }
        done('Minify failed, ' + (blob.name || 'file') + ' unparseable');
    }
};
