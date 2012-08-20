
var nopt = require('nopt'),
    known = {
        version: Boolean,
        help: Boolean,
        modules: Array
    },
    shorts = {
        "mods" : ["--modules"],
        "v" : ["--version"],
        "h" : ["--help"],
        "m" : ["--modules"]
    };

var parse = function() {
    var parsed = nopt(known, shorts);
    delete parsed.argv;
    return parsed;
};

exports.parse = parse;
