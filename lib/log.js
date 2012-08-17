require('colors');


var prefix = 'shifter'.magenta;

exports.info = function(str) {
    console.log(prefix, 'info'.white, str);
};

exports.warn = function(str) {
    console.log(prefix, 'warn'.yellow, str);
};

exports.error = function(str) {
    console.log(prefix, 'error'.red, str);
    process.exit(1);
};

exports.err = function(str) {
    console.log(prefix, 'err'.red, str);
};
