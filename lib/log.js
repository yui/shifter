/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var color = require('ansi-color').set;


var prefix = color('shifter', 'magenta');

exports.color = function (str, code) {
    if (code === 'gray' || code === 'grey') {
        code = 'white';
    }
    return color(str, code);
};

exports.info = function (str) {
    console.log(prefix, color('[info]', 'white'), str);
};

exports.log = function (str) {
    console.log(prefix, color('[queu]', 'cyan'), str);
};

exports.warn = function (str) {
    console.log(prefix, color('[warn]', 'yellow'), str);
};

exports.error = function (str) {
    console.log(prefix, color('[error]', 'red'), str);
    process.exit(1);
};

exports.err = function (str) {
    console.log(prefix, color('[err]', 'red'), str);
};
