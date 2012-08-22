var log = require('./log');

var version = require('../package.json').version;
var args = require('./args').parse();

if (args.version) {
    console.log(version);
}

if (args.help) {
    console.log('blazingly fast builds with shifter'.magenta + ('@' + version).white);
    console.log('');
    console.log('pass no arguments and shifter will build the module from the current directory');
    console.log('');
    console.log('   -v/--version            show version');
    console.log('   -h/--help               show this stuff');
    console.log('   -m/--modules <module>   limit the modules to build (array: -m foo -m bar)');
    console.log('   --lint [preferred|defaults|strict] (preferred is the default) lint mode: https://github.com/yui/yui-lint');
    console.log('   --strict                add "use strict" to module wrapper');
    console.log('   --walk                  Walk the current directory and shift all builds. (cd yui3/src && shifter --walk)');
    console.log('                               -m/--modules also supported here for filtering');
    console.log('   --watch                 Watch the current module and rebuild on file change (if meta file, a loader build will launch)');
    console.log('                               --quiet to mute stdout from sub build');
}

process.exit(0);
