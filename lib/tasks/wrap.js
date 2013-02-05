/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var Stack = require('../stack').Stack,
    fs = require('fs'),
    log = require('../log'),
    exists = require('../util').exists;

var read = function (files, callback) {
    var stack = new Stack(),
        str = [];

    if (typeof files === 'string') {
        files = [files];
    }

    files.forEach(function (file, id) {
        exists(file, stack.add(function (y) {
            if (y) {
                fs.readFile(file, 'utf8', stack.add(function (err, data) {
                    str[id] = data;
                }));
            } else {
                log.warn('failed to locate: ' + file);
            }
        }));
    });

    stack.done(function () {
        callback(str.join('\n'));
    });

};


exports.wrap = function (options, blob, done) {
    options = options || {}; //Not needed here??

    var prefix = '',
        postfix = '',
        stack = new Stack();

    if (options.prepend) {
        read(options.prepend, stack.add(function (str) {
            prefix = str;
        }));
    }

    if (options.append) {
        read(options.append, stack.add(function (str) {
            postfix = str;
        }));
    }

    stack.done(function () {
        var data = prefix + blob.result + postfix;

        done(null, new blob.constructor(data, blob));
    });
};
