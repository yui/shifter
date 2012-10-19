/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var color = require('ansi-color').set;
var hasColor = false;
var stdio;
var quiet;
var silent;
try {
    stdio = require("stdio");
    hasColor = stdio.isStderrATTY();
} catch (ex) {
    hasColor = true;
}

exports.isTTY = hasColor;

exports.quiet = function () {
    quiet = true;
};

exports.silent = function () {
    silent = true;
    quiet = true;
};

exports.reset = function() {
    silent = false;
    quiet = false;
};

exports.color = function (str, code) {
    if (!hasColor) {
        return str;
    }
    return color(str, code);
};

var prefix = exports.color('shifter', 'magenta');

exports.info = function (str) {
    if (!quiet) {
        console.log(prefix, color('[info]', 'white'), str);
    }
};

exports.log = function (str) {
    if (!quiet) {
        console.log(prefix, color('[queu]', 'cyan'), str);
    }
};

exports.warn = function (str) {
    if (!silent) {
        console.log(prefix, color('[warn]', 'yellow'), str);
    }
};

exports.error = function (str) {
    if (!silent) {
        console.error(prefix, color('[error]', 'red'), str);
    }
    process.exit(1);
};

exports.err = function (str) {
    if (!silent) {
        console.error(prefix, color('[err]', 'red'), str);
    }
};


exports.console = {
    log: function() {
        if (!quiet) {
            console.log.apply(this, arguments);
        }
    },
    error: function() {
        if (!silent) {
            console.error.apply(this, arguments);
        }
    }
};
