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
    console.log('   -m/--modules [module]   limit the modules to build (array: -m foo -m bar)');
    console.log('   --lint [preferred|defaults|strict] (preferred is the default) lint mode: https://github.com/yui/yui-lint');
    console.log('   --strict                add "use strict" to module wrapper');
    console.log('   -c/--config [file]      specify a config file name');
    console.log('   --ant                   parse the ant files and create a build.json but do not build');
    console.log('   --list                  List the builds and rollups from the build.json file');
    console.log('   --no-exec               Do not run pre/postbuild or pre/post execs');
    console.log('   --walk                  Walk the current directory and shift all builds. (cd yui3/src && shifter --walk)');
    console.log('                               -m/--modules also supported here for filtering');
    console.log('   --watch                 Watch the current module and rebuild on file change (if meta file, a loader build will launch)');
    console.log('                               --quiet to mute stdout from sub build');
    console.log('                               all other build options accepted here: (--strict, --lint, etc)');
    console.log('   --jsstamp/--no-jsstamp  Should it stamp the JS with the YUI.add wrapper, defaults to --stamp');
    console.log('Experimental Options:');
    console.log('   --semi                  Toggle on the strict semicolon checking in Uglify');
    console.log('   --cache/--no-cache      Cache the results of the build and bail if building for no reason, defaults to --no-cache');
    console.log('   --cache-file <path>     File to store build cache, defaults to $CWD/.shifter_meta');
    console.log('   --fail                  Fail the build if lint fails');
    console.log('   --compressor            Use YUI Compressor instead of uglify');
    console.log('   --no-lint               Skip JSlint, you better know what you are doing!');
}

process.exit(0);
