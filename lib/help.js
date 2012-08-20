var log = require('./log');

var version = require('../package.json').version;
var args = require('./args').parse();

if (args.version) {
    console.log(version);
}

if (args.help) {
    console.log('shifter'.magenta + ('@' + version).white);
    console.log('');
    console.log('pass no arguments and shifter will build the module from the current directory');
    console.log('');
    console.log('   -v/--version            show version');
    console.log('   -h/--help               show this stuff');
    console.log('   -m/--modules <module>   limit the modules to build (array: -m foo -m bar)');
    console.log('   --lint [prefered|defaults|strict] lint mode: https://github.com/yui/yui-lint');
    console.log('   --strict                add "use strict" to module wrapper');
}

process.exit(0);
