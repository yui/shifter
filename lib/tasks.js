
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


