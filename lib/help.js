var log = require('./log');

var version = require('../package.json').version;
var args = require('./args').parse();
var log = require('./log');

var http = require('http');
var request;
var latest;

if (args.version) {
    process.on('uncaughtException', function () {
        console.log(version);
        process.exit(0);
    });
    try {
        request = http.get('http://registry.npmjs.org/shifter/latest', function (res) {
            var c = '';
            res.on('data', function (chunk) {
                c += chunk;
            });
            res.on('end', function () {
                var json = JSON.parse(c);
                latest = json.version;
                if (version < latest) {
                    console.log(log.color('!!!WARNING!!!', 'red'));
                    console.log(log.color('your version ' + version + ' is out of date, the latest available version is ' + latest, 'red'));
                    console.log(log.color('update with: npm -g install shifter', 'blue'));
                    process.exit(1);
                }
            });
        }).on('error', function () {
            console.log(version);
            process.exit(0);
        });
        setTimeout(function () {
            request.abort();
            console.log(version);
            process.exit(0);
        }, 500);
    } catch (e) {
        console.log(version);
        process.exit(0);
    }
}

if (args.help) {
    console.log(log.color('blazingly fast builds with shifter', 'magenta') + log.color('@' + version, 'white'));
    console.log('');
    console.log('pass no arguments and shifter will build the module from the current directory');
    console.log('');
    console.log('   -v/--version            show version');
    console.log('   -h/--help               show this stuff');
    console.log('   -m/--modules [module]   limit the modules to build (array: -m foo -m bar)');
    console.log('   --build-dir [directory] specify the directory to which built files should be written');
    console.log('   --lint [config]         default mode or look for .jshintrc in path: https://github.com/yui/yui-lint');
    console.log('   --strict                add "use strict" to module wrapper');
    console.log('   -c/--config [file]      specify a config file name');
    console.log('   --ant                   parse the ant files and create a build.json but do not build');
    console.log('   --list                  List the builds and rollups from the build.json file');
    console.log('   --no-exec               Do not run pre/postbuild or pre/post execs');
    console.log('   --walk                  Walk the current directory and shift all builds. (cd yui3/src && shifter --walk)');
    console.log('                               -m/--modules also supported here for filtering');
    console.log('                               --no-progress to show the dots instead of the progress bar');
    console.log('   --watch                 Watch the current module and rebuild on file change (if meta file, a loader build will launch)');
    console.log('                               --quiet to mute stdout from sub build');
    console.log('                               all other build options accepted here: (--strict, --lint, etc)');
    console.log('   --jsstamp/--no-jsstamp  Should it stamp the JS with the YUI.add wrapper, defaults to --stamp');
    console.log('   --istanbul              Use Istanbul code coverage instead of YUITest for coverage build');
    console.log('Experimental Options:');
    console.log('   --semi                  Toggle on the strict semicolon checking in Uglify');
    console.log('   --cache/--no-cache      Cache the results of the build and bail if building for no reason, defaults to --no-cache');
    console.log('   --clean                 Remove the build directory before building (to clean old files)');
    console.log('   --compressor            Use YUI Compressor instead of uglify');
    console.log('   --fail                  Fail the build if lint fails');
    console.log('   --no-lint               Skip JSlint, you better know what you are doing!');
    console.log('   --lint-stderr           Force lint output to stderr instead of stdout');
    console.log('   --recursive             When running a walk, look at directories recursively');
    console.log('   --no-global-config      Do not search for a .shifter.json file up the working path');
    console.log('   --cssproc <base url>    Use the cssproc tool to create absolute URLs for CSS assets (combohander)');
    console.log('   --yui-module [file]     Specify a raw yui module file to be built. The file should contain a `YUI.add()` statement.');
    console.log('   --no-assets             Do not build skins or copy assets folders (e.g. if externally building skin via CSS preprocessor)');
    console.log('CLI Replacers:');
    console.log('   You can pass --replace-??=?? and shifter will attempt to replace these strings during the build');
    console.log('   You MUST use the = to tell nopt that you want to assign the value to the dynamic option.');
    console.log('   Examples:');
    console.log('       --replace-version=1.2.3 will replace @VERSION@ with 1.2.3');
    console.log('       --replace-foo=bar will replace @FOO@ with bar');
    console.log('       --replace-baz=bog will replace @BAZ@ with bog');
    process.exit(0);
}

