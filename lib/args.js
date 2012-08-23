
var nopt = require('nopt'),
    known = {
        version: Boolean,
        ant: Boolean,
        help: Boolean,
        strict: Boolean,
        modules: Array,
        walk: Boolean,
        watch: Boolean,
        quiet: Boolean,
        config: require('path'),
        lint: [ 'defaults', 'strict', 'preferred' ]
    },
    shorts = {
        "c": ["--config"],
        "w": ["--walk"],
        "mods" : ["--modules"],
        "v" : ["--version"],
        "h" : ["--help"],
        "m" : ["--modules"]
    };

var parse = function (args) {
    var parsed = nopt(known, shorts, (args || process.argv));
    delete parsed.argv;
    parsed.lint = parsed.lint || 'preferred';
    return parsed;
};

exports.parse = parse;
exports.shorts = shorts;
exports.known = known;
