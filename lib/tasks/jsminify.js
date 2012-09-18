/*
 * Copyright (c) 2011-2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
/*
 * The comment/license workaround is based on the Ender workaround here:
 * https://github.com/ender-js/Ender/blob/76961673be2a29e893d8d3dc9b97e3faf8b169a6/lib/ender.file.js#L25-58
 * Ender is licensed under MIT - copyright 2012 Dustin Diaz & Jacob Thornton
 * http://ender.no.de/
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
        comments = [],
        token = '"Shifter: preserved comment block"',
        reMultiComments = /\/\*![\s\S]*?\*\//g,
        /*
            In some cases Uglify adds a comma, in others it doesn't
            So we have to process the tokens twice, first with the comma
            then without it to catch both cases and to be clear about it.
        */
        reTokens1 = new RegExp(token + ',', 'g'),
        reTokens = new RegExp(token, 'g'),
        source = blob.result,
        ast;

    try {

        source = source.replace(reMultiComments, function (comment) {
            comments.push(comment);
            return ';' + token + ';';
        });
        
        config.ascii_only = true; //Force ascii
        ast = parser.parse(source, config.semicolon || false);

        if (config.mangle) {
            ast = uglify.ast_mangle(ast, config);
        }
        if (config.squeeze) {
            ast = uglify.ast_squeeze(ast, config);
        }

        source = uglify.gen_code(ast, config);

        //First pass with comma (comment inside source somewhere
        source = source.replace(reTokens1, function () {
            return '\n' + comments.shift() + '\n';
        });

        //Second pass without the comma to catch normal comments
        source = source.replace(reTokens, function () {
            return '\n' + comments.shift() + '\n';
        });

        if (source.substr(source.length - 1) === ')') {
            source += ';';
        }
        source += '\n';
        console.log(source.toString('utf8'));

        done(null, new blob.constructor(source, blob));
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
