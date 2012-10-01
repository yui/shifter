
var nopt = require('nopt'),
    known = {
        exec: Boolean,
        version: Boolean,
        progress: Boolean,
        compressor: Boolean,
        istanbul: Boolean,
        semi: Boolean,
        coverage: Boolean,
        ant: Boolean,
        help: Boolean,
        strict: Boolean,
        fail: Boolean,
        modules: Array,
        walk: Boolean,
        'lint-stderr': Boolean,
        watch: Boolean,
        quiet: Boolean,
        cache: Boolean,
        jsstamp: Boolean,
        list: Boolean,
        config: require('path'),
        lint: [ 'config', false ]
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

var has = function (a) {
    var cooked = raw().argv.cooked,
        ret = false;

    cooked.forEach(function (o) {
        if ((o === '--' + a) || (o === '--no-' + a)) {
            ret = true;
        }
    });

    return ret;
};

var parse = function (args) {
    var parsed = raw(args);
    delete parsed.argv;
    //default 'preferred'
    if (parsed.lint !== false) {
        parsed.lint = parsed.lint || 'preferred';
    }
    //Default true
    parsed.jsstamp = (parsed.jsstamp === undefined || parsed.jsstamp) ? true : false;
    parsed.coverage = (parsed.coverage === undefined || parsed.coverage) ? true : false;
    parsed.exec = (parsed.exec === undefined || parsed.exec) ? true : false;
    parsed.progress = (parsed.progress === undefined || parsed.progress) ? true : false;

    //Default false
    parsed.semi = (parsed.semi === undefined || parsed.semi === false) ? false : true;
    parsed.cache = (parsed.cache === undefined || parsed.cache === false) ? false : true;
    parsed.istanbul = (parsed.istanbul === undefined || parsed.istanbul === false) ? false : true;
    parsed.quiet = (parsed.quiet === undefined || parsed.quiet === false) ? false : true;
    parsed['lint-stderr'] = (parsed['lint-stderr'] === undefined || parsed['lint-stderr'] === false) ? false : true;
    return parsed;
};

exports.has = has;
exports.raw = raw;
exports.parse = parse;
exports.shorts = shorts;
exports.known = known;
