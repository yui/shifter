var nopt = require('nopt'),
    known = {
        'ant': Boolean,
        'assets': Boolean,
        'build-dir': String,
        'cache': Boolean,
        'clean': Boolean,
        'color': Boolean,
        'compressor': Boolean,
        'config': require('path'),
        'coverage': Boolean,
        'csslint': Boolean,
        'cssproc': String,
        'excludes': Array,
        'exec': Boolean,
        'fail': Boolean,
        'global-config': Boolean,
        'help': Boolean,
        'istanbul': Boolean,
        'jsstamp': Boolean,
        'lint': [ 'config', false ],
        'lint-stderr': Boolean,
        'list': Boolean,
        'modules': Array,
        'progress': Boolean,
        'quiet': Boolean,
        'recursive': Boolean,
        'semi': Boolean,
        'silent': Boolean,
        'strict': Boolean,
        'version': Boolean,
        'walk': Boolean,
        'watch': Boolean,
        'yui-module': require('path')
    },
    shorts = {
        "c": ["--config"],
        "h" : ["--help"],
        "m" : ["--modules"],
        "mods" : ["--modules"],
        "v" : ["--version"],
        "w": ["--walk"],
        "x": ["--excludes"]
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

// Get the base arguments list without defaults applied.
var baseOptions = function(args) {
    var options = {},
        key;

    // Get any supplied arguments if not specified.
    if (!args) {
        args = clean();
    }

    // Define all of the base arguments.
    for (key in known) {
        if (known.hasOwnProperty(key)) {
            options[key] = undefined;
        }
    }

    // Add any supplied overrides.
    for (key in args) {
        // And override with the specified arguments.
        if (args.hasOwnProperty(key)) {
            options[key] = args[key];
        }
    }

    return options;
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
    parsed.assets = (parsed.assets === undefined || parsed.assets) ? true : false;

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
exports.baseOptions = baseOptions;
exports.has = has;
exports.raw = raw;
exports.parse = parse;
exports.shorts = shorts;
exports.known = known;
