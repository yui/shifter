/*jslint stupid: true, regexp: true, nomen: true */
/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var Stack = require('./stack').Stack,
    path = require('path'),
    fs = require('fs'),
    util = require('util'),
    mkdirp = require('mkdirp'),
    log = require('./log'),
    noop = function () {},
    tasks = require('./tasks'),
    lint = require('yui-lint'),
    Queue = require('gear').Queue,
    Registry = require('gear').Registry,
    registry,
    strictMode = false,
    defaultLint = lint.defaults,
    _exec = require('child_process').exec,
    rimraf = require('rimraf'),
    ncp = require('ncp').ncp,
    jslintConfig = {},
    lintFail = false,
    metaFile = path.join(process.cwd(), '.shifter_meta'),
    cacheBuild = false,
    cssLint = {
        config: null,
        callback: function (info) {
            var file = info.name.replace(process.cwd(), ''),
                lint = info.csslint,
                counter = 0;
            if (!!lint && lint.length) {
                log.err(file + ' contains ' + lint.length + ' lint errors');

                lint.forEach(function (item) {
                    counter = counter + 1;
                    console.log('   #' + counter + ': ' + ('[' + item.type + ']').red + ' ' + item.message.yellow);
                    if (item.evidence) {
                        console.log('       ' + String(item.evidence).trim() + (' // line ' + item.line + ', pos ' + item.col).grey);
                    }
                });
            } else {
                log.info('css lint passed for ' + file);
            }
        }
    },
    setJSLint = function () {
        var i;
        jslintConfig = {
            config: {},
            callback: function (linted) {
                var messages = linted.jslint || [],
                    counter = 0;
                if (messages.length) {
                    log.err(linted.name + ' contains ' + messages.length + ' lint errors');
                    messages.forEach(function (item) {
                        if (item && item.reason) {
                            counter = counter + 1;
                            console.log('   #' + counter + ': ' + item.reason.yellow);
                            if (item.evidence) {
                                console.log('       ' + String(item.evidence).trim() + (' // line ' + item.line + ', pos ' + item.character).grey);
                            }
                        }
                    });
                    if (lintFail) {
                        log.error('lint failed, aborting build');
                    }
                }
            }
        };
        for (i in defaultLint) {
            if (defaultLint.hasOwnProperty(i)) {
                jslintConfig.config[i] = defaultLint[i];
            }
        }
    },
    resolve = function (items, dir) {
        var i = [];
        if (!Array.isArray(items)) {
            return null;
        }
        items.forEach(function (file, key) {
            var d = dir;
            if (file.indexOf(d + '/') === 0 || file.indexOf('./' + d) === 0) {
                d = '';
            }
            i[key] = path.join(process.cwd(), d, file);
        });
        return i;
    },
    stringify = function (config) {
        var str = JSON.stringify(config) || '';
        str = str.replace(/:/g, ': ').replace(/,/g, ', ');
        if (str === '{}' || str === '[]') {
            str = '';
        }
        if (str !== '') {
            str = ', ' + str;
        }
        return str;
    },
    buildDir = path.join(process.cwd(), '../../build'),
    loggerRegex = /^.*?(?:logger|Y.log).*?(?:;|\).*;|(?:\r?\n.*?)*?\).*;).*;?.*?\r?\n/mg,
    metaData = {},
    exists = fs.existsSync || path.existsSync;


var loadMeta = function () {
    if (cacheBuild) {
        if (exists(metaFile)) {
            log.info('found shifter meta-data, loading from ' + metaFile);
            var data  = fs.readFileSync(metaFile, 'utf8').split('\n');
            data.forEach(function (value) {
                var parts = value.split(':');
                metaData[parts[0]] = parts[1];
            });
        }
    }
};

process.on('exit', function () {
    if (cacheBuild) {
        log.info('writing build meta-data to disk');
        var values = [];
        Object.keys(metaData).forEach(function (name) {
            values.push(name + ':' + metaData[name]);
        });
        values.sort();
        fs.writeFileSync(metaFile, values.join('\n'), 'utf8');
    }
});

registry = new Registry({
    dirname: path.resolve(__dirname, '../', 'node_modules', 'gear-lib', 'lib')
});


registry.load({
    tasks: tasks
});


exports.loggerRegex = loggerRegex;
exports.buildDir = buildDir;

var buildCSS = function (mod, name, callback) {
    var queue = new Queue({
        logger: log,
        registry: registry
    });

    queue.read(resolve(mod.cssfiles, 'css'))
        .concat()
        .cssstamp({
            stamp: '/* YUI CSS Detection Stamp */\n#yui3-css-stamp.' + name + ' { display: none; }'
        })
        .csslint(cssLint)
        .write(path.join(buildDir, name, name + '.css'))
        .compressor({
            'line-break': 6000,
            type: 'css'
        })
        .write(path.join(buildDir, name, name + '-min.css'))
        .run(function (err, result) {
            if (err) {
                log.err('css: ' + err);
            }
            callback();
        });

};

exports.css = buildCSS;

var buildJS = function (mod, name, callback) {

    var queue = new Queue({
        logger: log,
        registry: registry
    }),
        bail = false,
        modName = mod.name || name,
        fileName = mod.basefilename || name,
        replacers = [],
        regex = (typeof mod.regex !== 'undefined') ? mod.regex : loggerRegex;

    queue.read(resolve(mod.jsfiles, 'js'))
        .concat();

    if (mod.stamp) {
        queue.jsstamp({
            strict: strictMode,
            prefix: "YUI.add('" + modName + "', function (Y, NAME) {\n\n",
            postfix: "\n\n}, '@VERSION@'" + stringify(mod.config) + ");\n"
        });
    }

    queue.wrap({
        prepend: resolve(mod.prependfiles, 'js'),
        append: resolve(mod.appendfiles, 'js')
    });

    if (mod.replace) {
        Object.keys(mod.replace).forEach(function (key) {
            replacers.push({
                regex: key,
                replace: mod.replace[key]
            });
        });
        queue.replace(replacers);
    }

    queue.jslint(jslintConfig)
        .md5check({
            callback: function (md5) {
                var key = path.join(fileName, fileName + '-debug.js');
                metaData[key] = md5;
            },
            error: cacheBuild,
            current: metaData[path.join(fileName, fileName + '-debug.js')]
        })
        .write(path.join(buildDir, fileName, fileName + '-debug.js'));

    if (regex) {
        queue.replace({
            regex: regex
        }); // Strip Y.log's
    }

    queue.log('writing RAW file')
        .write(path.join(buildDir, fileName, fileName + '.js'))
        .log('compressing')
        .compressor({
            'disable-optimizations': true,
            'preserve-semi': true,
            'line-break': 6000
        })
        .log('writing -min file')
        .write(path.join(buildDir, fileName, fileName + '-min.js'))
        .run(function (err, result) {
            if (err) {
                log.err(name + ': ' + err);
            }
            callback(err, result);
        });

};

exports.js = buildJS;

var buildCoverage = function (mod, name, callback) {
    log.info('shifting for coverage');
    var queue = new Queue({
        logger: log,
        registry: registry
    }),
        fileName = mod.basefilename || name;

    queue.read([
        path.join(buildDir, fileName, fileName + '.js')
    ])
        .log('coverage file read, starting coverage')
        .coverage({
            charset: 'utf8',
            name: 'build/' + fileName + '/' + fileName + '.js'
        })
        .log('writing coverage file')
        .write(path.join(buildDir, fileName, fileName + '-coverage.js'))
        .run(function (err, result) {
            if (err) {
                log.err('coverage: ' + err);
            }
            callback();
        });

};

exports.coverage = buildCoverage;

var buildLang = function (mod, name, callback) {
    var langs = mod.config.lang,
        stack = new Stack();

    langs.unshift('');
    log.info('shifting ' + langs.length + ' langs for ' + name);

    langs.forEach(function (lang) {
        var queue = new Queue({
                logger: log,
                registry: registry
            }),
            modName = name + (lang ? '_' + lang : ''),
            fileName = modName + '.js',
            strings = fs.readFileSync(path.join(process.cwd(), 'lang', fileName), 'utf8');

        queue.read([path.join(__dirname, '../files/langtemplate.txt')])
            .replace([
                {
                    regex: /@LANG_MODULE@/,
                    replace: 'lang/' + modName
                },
                {
                    regex: /@YUIVAR@/,
                    replace: 'Y'
                },
                {
                    regex: /@MODULE@/,
                    replace: name
                },
                {
                    regex: /@LANG@/,
                    replace: lang
                },
                {
                    regex: /@STRINGS@/,
                    replace: strings
                },
                {
                    regex: /@LANG_DETAILS@/,
                    replace: ''
                }
            ])
            .compressor({
                'disable-optimizations': true,
                'preserve-semi': true,
                'line-break': 6000
            })
            .write(path.join(buildDir, name, 'lang', fileName))
            .run(stack.add(function (err, result) {
                if (err) {
                    log.err('lang: ' + err);
                } else {
                    log.info('shifted lang for ' + name);
                }
            }));

    });

    stack.done(callback);

};

exports.lang = buildLang;

var copyAssets = function (mod, name, callback) {
    log.info('shifting assets for ' + name);

    var from = path.join(process.cwd(), 'assets'),
        to = path.join(buildDir, name, 'assets');

    if (exists(from)) {
        ncp(from, to, callback);
    } else {
        callback();
    }
};

var buildSkin = function (mod, name, callback) {
    log.info('shifting skin for ' + name);

    var stack = new Stack(),
        from = path.join(process.cwd(), 'assets'),
        to = path.join(buildDir, name, 'assets');

    if (exists(from)) {
        ncp(from, to, stack.add(function () {
            //Get list of Skins
            fs.readdir(path.join(process.cwd(), 'assets/skins'), stack.add(function (err, skins) {

                //Walk the skins and write them out
                skins.forEach(function (skinName) {
                    //Write the full skin file with core
                    var queue = new Queue({
                        logger: log,
                        registry: registry
                    }),
                        base = path.join(process.cwd(), 'assets/skins/', skinName);

                    queue.read([
                        path.resolve(base, '../../', name + '-core.css'),
                        path.join(base, name + '-skin.css')
                    ])
                        .log('copying assets to skin for ' + skinName)
                        .concat()
                        .csslint(cssLint)
                        .cssstamp({
                            stamp: '/* YUI CSS Detection Stamp */\n#yui3-css-stamp.skin-' + skinName + '-' + name + ' { display: none; }'
                        })
                        .compressor({
                            'line-break': 6000,
                            type: 'css'
                        })
                        .log('writing skin file with core wrapper')
                        .write(path.join(buildDir, name, 'assets', 'skins', skinName, name + '.css'))
                        .run(stack.add(function () {

                            //Write the skin file without core
                            var Rqueue = new Queue({
                                    logger: log,
                                    registry: registry
                                });

                            Rqueue.read([
                                path.join(base, name + '-skin.css')
                            ])
                                .log('writing skin file without core wrapper')
                                .write(path.join(buildDir, name, 'assets', 'skins', skinName, name + '-skin.css'))
                                .run(stack.add(function () {
                                }));
                        }));
                });

            }));
        }));
    }

    stack.done(callback);

};

exports.skin = buildSkin;

var buildCopy = function (mod, name, callback) {
    log.info('shifting a copy');
    mod.copy.forEach(function (value, key) {
        mod.copy[key] = [
            path.resolve(value[0]),
            path.resolve(value[1])
        ];
    });

    var copy = function () {
        var item = mod.copy.shift(),
            from,
            to;

        if (!item) {
            log.info('down shifting the copy');
            return callback();
        }
        from = item[0];
        to = item[1];

        rimraf(to, function () {
            log.info('copying from ' + from + ' to ' + to);
            var stat = fs.statSync(from),
                fromS,
                toS,
                toDir;

            if (stat.isDirectory()) {
                ncp(from, to, function () {
                    copy();
                });
            } else {
                if (stat.isFile()) {
                    toDir = path.dirname(to);
                    if (!exists(toDir)) {
                        mkdirp.sync(toDir);
                    }
                    fromS = fs.createReadStream(from);
                    toS = fs.createWriteStream(to);
                    util.pump(fromS, toS, copy);
                }
            }
        });
    };

    copy();

};

exports.copy = buildCopy;


var build = function (mod, name, options, callback) {
    var stack = new Stack();

    defaultLint = lint[options.lint];
    log.info('using ' + options.lint + ' jslint setting');
    setJSLint();

    if (options['cache-file']) {
        metaFile = options['cache-file'];
    }

    loadMeta();

    cacheBuild = options.cache;

    if (options.strict) {
        strictMode = true;
    }
    if (options.fail) {
        lintFail = true;
    }
    mod.stamp = options.jsstamp;

    if (mod.jsfiles) {
        exports.js(mod, name, stack.add(function (err, result) {
            if (err) {
                log.warn('skipping coverage file build due to previous build error');
            } else {
                exports.coverage(mod, name, stack.add(noop));
            }
            if (mod.config.skinnable || mod.skinnable) {
                exports.skin(mod, name, stack.add(noop));
            } else if (mod.assets) {
                copyAssets(mod, name, stack.add(noop));
            }
            if (mod.config.lang) {
                exports.lang(mod, name, stack.add(noop));
            }
        }));
    }
    if (mod.cssfiles) {
        exports.css(mod, name, stack.add(noop));
    }

    if (mod.copy) {
        exports.copy(mod, name, stack.add(noop));
    }

    stack.done(callback);
};

var exec = function (exec, name, callback) {
    log.info('found an exec, shifting the build');
    var stack = new Stack();

    if (typeof name === 'function') {
        callback = name;
        name = 'global';
    }

    exec.forEach(function (cmd) {
        log.info('executing ' + cmd);
        var child = _exec(cmd, {
            cwd: process.cwd()
        }, stack.add(function (error, stdout, stderr) {
            if (stderr) {
                log.err('start output from ' + cmd + '\n');
                console.error(stderr);
                log.err('end output from ' + cmd);
            } else {
                log.info('start output from ' + cmd + '\n');
                console.log(stdout);
                log.info('end output from ' + cmd);
            }
        }));
    });

    stack.done(callback);
};

exports.exec = exec;

exports.build = function (mod, name, options, callback) {
    var end = function () {
        if (mod.postexec) {
            exec(mod.postexec, name, callback);
        } else {
            callback();
        }
    };
    if (mod.exec) {
        exec(mod.exec, name, function () {
            build(mod, name, options, end);
        });
    } else {
        build(mod, name, options, end);
    }
};

/*
    Rollups are sync since they are rolling up a build we need to make sure the builds are
    complete before we run the next that might need it.
*/


var _rollup = function (mod, name, options, callback) {
    var queue = new Queue({
        registry: registry,
        logger: log
    }),
        modName = mod.name || name,
        regex = (typeof mod.regex !== 'undefined') ? mod.regex : loggerRegex,
        files = [];

    mod.files.forEach(function (file) {
        files.push(path.join(process.cwd(), '../../build/', file, file + '-debug.js'));
    });

    queue.read(files)
        .concat()
        .jsstamp({
            postfix: "YUI.add('" + modName + "', function (Y, NAME) {}, '@VERSION@'" + stringify(mod.config) + ");\n"
        })
        .write(path.join(buildDir, name, name + '-debug.js'));

    if (regex) {
        queue.replace({
            regex: regex
        }); // Strip Y.log's
    }

    queue.jslint(jslintConfig)
        .log('linting done, writing ' + name + '.js')
        .write(path.join(buildDir, name, name + '.js'))
        .compressor({
            'disable-optimizations': true,
            'preserve-semi': true,
            'line-break': 6000
        })
        .write(path.join(buildDir, name, name + '-min.js'))
        .run(function (err, result) {
            if (err) {
                log.err(name + ' rollup: ' + err);
            }
            callback();
        });
};

exports.rollup = function (mods, callback) {
    if (!mods || !mods.length) {
        return callback();
    }

    //No caching for rollups
    cacheBuild = false;

    var item = mods.shift(),
        options,
        name,
        mod,
        i;
    if (item) {
        name = item.mod.name || item.name;
        options = item.options;
        mod = item.mod;

        if (mod.build) {
            log.info('found a sub build, down shifting');
            mod.build.name = mod.build.name || name;
            for (i in mod) {
                if (mod.hasOwnProperty(i)) {
                    if (i !== 'files' && i !== 'build') {
                        if (!mod.build[i]) {
                            mod.build[i] = mod[i];
                        }
                    }
                }
            }
            build(mod.build, name, options, function () {
                delete mod.build;
                log.info('sub build complete, up shifting to rollup');
                _rollup(mod, name, options, function () {
                    exports.rollup(mods, callback);
                });
            });
        } else {
            _rollup(mod, name, options, function () {
                exports.rollup(mods, callback);
            });
        }
    } else {
        callback();
    }
};

