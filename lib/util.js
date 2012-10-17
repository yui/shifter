var fs = require('fs'),
    path = require('path');


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
            cb(true);
            return;
        }
        find(next, file, cb);
    }
};

exports.find = find;
