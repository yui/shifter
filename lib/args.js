
var nopt = require('nopt'),
    known = {
        version: Boolean,
        ant: Boolean,
        help: Boolean,
        strict: Boolean,
        fail: Boolean,
        modules: Array,
        walk: Boolean,
        watch: Boolean,
        quiet: Boolean,
        cache: Boolean,
        config: require('path'),
        'cache-file': require('path'),
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

var raw = function (args) {
    var parsed = nopt(known, shorts, (args || process.argv));
    return parsed;
};

var parse = function (args) {
    var parsed = raw(args);
    delete parsed.argv;
    parsed.lint = parsed.lint || 'preferred';
    parsed.cache = (parsed.cache === undefined || parsed.cache === false) ? false : true;
    return parsed;
};

exports.raw = raw;
exports.parse = parse;
exports.shorts = shorts;
exports.known = known;
