
var nopt = require('nopt'),
    known = {
        version: Boolean,
        help: Boolean,
        strict: Boolean,
        modules: Array,
        lint: [ 'defaults', 'strict', 'preferred' ]
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
    parsed.lint = parsed.lint || 'preferred'
    return parsed;
};

exports.parse = parse;
