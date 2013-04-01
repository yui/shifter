
var nopt = require('nopt'),
    known = {
        color: Boolean,
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
        recursive: Boolean,
        'lint-stderr': Boolean,
        watch: Boolean,
        quiet: Boolean,
        silent: Boolean,
        cache: Boolean,
        jsstamp: Boolean,
        list: Boolean,
        clean: Boolean,
        cssproc: String,
        config: require('path'),
        lint: [ 'config', false ],
        csslint: Boolean,
        'global-config': Boolean,
        'build-dir': String,
        'yui-module': require('path')
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

var clean = function(args) {
    var parsed = raw(args);
    delete parsed.argv;
    return parsed;
};

var setDefaults = function(parsed) {
    if (parsed === undefined) {
        parsed = clean();
    }
    //Default true
    parsed.jsstamp = (parsed.jsstamp === undefined || parsed.jsstamp) ? true : false;
    parsed.coverage = (parsed.coverage === undefined || parsed.coverage) ? true : false;
    parsed.exec = (parsed.exec === undefined || parsed.exec) ? true : false;
    parsed.csslint = (parsed.csslint === undefined || parsed.csslint) ? true : false;
    parsed.color = (parsed.color === undefined || parsed.color) ? true : false;
    parsed['global-config'] = (parsed['global-config'] === undefined || parsed['global-config']) ? true : false;
    parsed.istanbul = (parsed.istanbul === undefined || parsed.istanbul) ? true : false;

    //Default false
    parsed.semi = (parsed.semi === undefined || parsed.semi === false) ? false : true;
    parsed.cache = (parsed.cache === undefined || parsed.cache === false) ? false : true;
    parsed.quiet = (parsed.quiet === undefined || parsed.quiet === false) ? false : true;
    parsed.silent = (parsed.silent === undefined || parsed.silent === false) ? false : true;
    parsed.clean = (parsed.clean === undefined || parsed.clean === false) ? false : true;
    parsed['lint-stderr'] = (parsed['lint-stderr'] === undefined || parsed['lint-stderr'] === false) ? false : true;
    parsed.progress = (parsed.progress === undefined || parsed.progress === false) ? false : true;
    parsed.recursive = (parsed.recursive === undefined || parsed.recursive === false) ? false : true;
    
    if (parsed.recursive) {
        parsed.walk = true;
    }
    //Other defaults
    if (!parsed['build-dir']) {
        if (parsed.recursive || !parsed.walk) {
            parsed['build-dir'] = '../../build';
        } else {
            parsed['build-dir'] = '../build';
        }
    }


    return parsed;
};

var parse = function (args) {
    var parsed = clean(args);
    return setDefaults(parsed);
};

exports.defaults = setDefaults;
exports.has = has;
exports.raw = raw;
exports.parse = parse;
exports.shorts = shorts;
exports.known = known;
