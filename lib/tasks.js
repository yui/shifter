/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var fs = require('fs'),
    path = require('path');


var files = fs.readdirSync(path.join(__dirname, './tasks/'));

var tasks = [];
files.forEach(function(file) {
    if (path.extname(file) === '.js') {
        var mod = require('./tasks/' + file);

        for (var name in mod) {
            exports[name] = mod[name]; 
        }
    }
});


