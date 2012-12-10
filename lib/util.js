var fs = require('fs'),
    path = require('path');

exports.exists = fs.exists || path.exists;
exports.existsSync = fs.existsSync || path.existsSync;

var find = function(dir, file, cb) {
    var files = fs.readdirSync(dir),
    found = files.some(function(f) {
        if (f === file) {
            cb(null, path.join(dir, f));
            return true;
        }
    }),
    next = path.join(dir, '../');

    if (!found) {
        if (dir === next) {
            cb('not found', null);
            return;
        }
        find(next, file, cb);
    }
};

exports.find = find;



exports.shifter = path.join(__dirname, '../bin/shifter');
