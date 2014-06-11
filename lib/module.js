/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var Stack = require('./stack').Stack,
    path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    log = require('./log'),
    noop = function () {},
    tasks = require('./tasks'),
    shifter = require('./index'),
    util = require('./util'),
    exists = util.existsSync,
    lint = require('yui-lint'),
    which = require('which').sync,
    Queue = require('gear').Queue,
    Registry = require('gear').Registry,
    registry,
    cpr = require('cpr').cpr,
    cprOptions = {
        filter: function(item) {
            var parts = item.split(path.sep),
                ret = true;
            parts.forEach(function(i) {
                if (i.indexOf('.') === 0) {
                    ret = false;
                }
            });
            return ret;
        },
        //deleteFirst: true,
        //overwrite: true,
        confirm: true
    },
    cName = {
        compressor: 'YUICompressor',
        jsminify: 'UglifyJS'
    },
    coverageType = 'yuitest',
    compressorFn,
    compressorConfig,
    configCompressor = function (options) {
        if (options.compressor) {
            compressorFn = 'compressor';
            compressorConfig = {
                'disable-optimizations': true,
                'preserve-semi': true,
                'line-break': 6000
            };
        } else {
            compressorFn = 'jsminify';
            compressorConfig = {
                callback: function (e) {
                    log.err('compression failed');
                    log.console.log('       ' + String(e.message).trim() + log.color(' // line ' + e.line + ', pos ' + e.col, 'white'));
                    log.err('dropped the clutch, build failed');
                    // Not calling back here, the jsminify task will callback with an error, failing the queue
                }
            };
        }
    },
    strictMode = false,
    cssLint = true,
    defaultLint = lint.defaults,
    _exec = require('child_process').exec,
    rimraf = require('rimraf'),
    jshintConfig = {},
    lintFail = false,
    lintSTDError = false,
    cacheBuild = false,
    replaceOptions = [],
    cssLintConfig = {
        config: null,
        callback: function (info) {
            var file = info.name.replace(shifter.cwd(), ''),
                lint = info.csslint,
                fn = 'log',
                counter = 0;
            if (lintSTDError) {
                fn = 'error';
            }
            if (!!lint && lint.length) {
                log.err(file + ' contains ' + lint.length + ' lint errors');

                lint.forEach(function (item) {
                    counter = counter + 1;
                    log.console[fn]('   #' + counter + ': ' + log.color('[' + item.type + ']', 'red') + ' ' + log.color(item.message, 'yellow'));
                    if (item.evidence) {
                        log.console[fn]('       ' + String(item.evidence).trim() + log.color(' // line ' + item.line + ', pos ' + item.col, 'white'));
                    }
                });
                if (lintFail) {
                    // Return an error to callback with, which should fail the build
                    return 'lint failed, aborting build';
                }
            } else {
                log.info('css lint passed for ' + file);
            }
        }
    },
    parseJSHintConfig = function (file) {
        var str = fs.readFileSync(file, 'utf8');
        //Borrowed from jshint
        str = str.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\//g, '');
        str = str.replace(/\/\/[^\n\r]*/g, ''); //everything after "//"

        return JSON.parse(str);
    },
    fetchJSHintConfig = function () {
        var json = null;
        util.find(shifter.cwd(), '.jshintrc', function (err, file) {
            if (file) {
                log.info('loading jshint config from: ' + file);
                json = parseJSHintConfig(file);
            }
        });
        return json;
    },
    setJSLint = function () {
        var i;
        jshintConfig = {
            config: {},
            callback: function (linted) {
                var messages = lint.filter(linted.jshint) || [],
                    counter = 0,
                    fn = 'log';
                if (lintSTDError) {
                    fn = 'error';
                }

                if (messages.length) {
                    log.err(linted.name + ' contains ' + messages.length + ' lint errors');
                    messages.forEach(function (item) {
                        if (item && item.reason) {
                            counter = counter + 1;
                            log.console[fn]('   #' + counter + ': ' + log.color(item.reason, 'yellow'));
                            if (item.evidence) {
                                log.console[fn]('       ' + String(item.evidence).trim() +
                                    log.color(' // line ' + item.line + ', pos ' + item.character, 'white'));
                            }
                        }
                    });
                    if (lintFail) {
                        // Return an error to callback with, which should fail the build
                        return 'lint failed, aborting build';
                    }
                }
            }
        };
        for (i in defaultLint) {
            if (defaultLint.hasOwnProperty(i)) {
                jshintConfig.config[i] = defaultLint[i];
            }
        }
        if (strictMode) {
            jshintConfig.config.strict = true;
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
            i[key] = path.join(shifter.cwd(), d, file);
        });
        return i;
    },
    stringify = function (config) {
        config = config || {};
        //This may need tweaked..
        if (config.after) {
            delete config.after;
        }
        var str = JSON.stringify(config);
        if (str.length > 100) {
            str = JSON.stringify(config, null, 4);
        } else {
            str = str.replace(/:/g, ': ').replace(/,/g, ', ');
        }
        if (str === '{}' || str === '[]') {
            str = '';
        }
        if (str !== '') {
            str = ', ' + str;
        }
        return str;
    },
    globalRegex = /^.*?Y.log.*?(?:;|\).*;|(?:\r?\n.*?)*?\).*;).*;?.*?\r?\n/mg;



registry = new Registry();

registry.load({
    tasks: require('gear-lib')
});

registry.load({
    tasks: tasks
});

var _replaceOptions = [
    {
        regex: '@YUIGLOBALVAR@',
        replace: 'YUI'
    },
    {
        regex: '@YUIVAR@',
        replace: 'Y'
    }
];

exports.reset = function() {
    replaceOptions = [].concat(_replaceOptions);
};

exports.globalRegex = globalRegex;

var buildCSS = function (mod, name, callback) {
    var queue = new Queue({
        logger: log,
        registry: registry
    }),
      replacers = [];

    queue.read(resolve(mod.cssfiles, 'css'))
        .concat()
        .replace(replaceOptions);

    if (defaultLint && cssLint) {
        queue.csslint(cssLintConfig);
    }

    if (mod.replace) {
      Object.keys(mod.replace).forEach(function (key) {
        replacers.push({
          regex: key,
          replace: mod.replace[key]
        });
      });
      queue.replace(replacers);
    }

    queue.cssstamp({
            stamp: '/* YUI CSS Detection Stamp */\n#yui3-css-stamp.' + name + ' { display: none; }'
        })
        .md5check({
            error: cacheBuild,
            current: path.join(mod.buildDir, name, name + '.css')
        })
        .check()
        .cssproc({
            url: mod.cssproc,
            root: mod.buildDir,
            file: path.join(mod.buildDir, name, name + '.css')
        })
        .write(path.join(mod.buildDir, name, name + '.css'))
        .cssmin()
        .check()
        .write(path.join(mod.buildDir, name, name + '-min.css'))
        .run(function (err) {
            if (err) {
                if (/file has not changed/.test(err)) {
                    log.warn(name + ': ' + err);
                } else {
                    log.errors(err);
                }
                return callback('failed to build module ' + name);
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
        modName = mod.name || name,
        fileName = mod.basefilename || name,
        replacers = [],
        regex = (typeof mod.regex !== 'undefined') ? mod.regex : globalRegex;

    if (mod.yuifile) {
        queue.read([mod.yuifile])
            .concat();
        queue.fn2string({
            name: modName,
            path: mod.yuifile
        });
    } else if (mod.jsfiles) {
        queue.read(resolve(mod.jsfiles, 'js'))
            .concat();
    }

    if (mod.stamp) {
        if (mod.yuifile) {
            queue.jsstamp({
                strict: strictMode,
                prefix: "@YUIGLOBALVAR@.add('" + modName + "', ",
                postfix: ", '@VERSION@'" + stringify(mod.config) + ");\n"
            });
        } else {
            queue.jsstamp({
                strict: strictMode,
                prefix: "@YUIGLOBALVAR@.add('" + modName + "', function (@YUIVAR@, NAME) {\n\n",
                postfix: "\n\n}, '@VERSION@'" + stringify(mod.config) + ");\n"
            });
        }
    }

    queue.wrap({
        prepend: resolve(mod.prependfiles, 'js'),
        append: resolve(mod.appendfiles, 'js')
    });

    queue.replace(replaceOptions);

    if (mod.replace) {
        Object.keys(mod.replace).forEach(function (key) {
            replacers.push({
                regex: key,
                replace: mod.replace[key]
            });
        });
        queue.replace(replacers);
    }
    if (defaultLint) {
        queue.jshint(jshintConfig);
    }

    queue.md5check({
        error: cacheBuild,
        current: path.join(mod.buildDir, fileName, fileName + '-debug.js')
    })
        .check()
        .write(path.join(mod.buildDir, fileName, fileName + '-debug.js'));

    if (regex) {
        queue.replace({
            regex: regex
        }); // Strip Y.log's
    }

    queue.log('writing RAW file')
        .check()
        .write(path.join(mod.buildDir, fileName, fileName + '.js'))
        .log('compressing ' + path.join(fileName, fileName + '.js with ' + cName[compressorFn]));

    queue[compressorFn](compressorConfig)
        .log('writing -min file')
        .check()
        .write(path.join(mod.buildDir, fileName, fileName + '-min.js'))
        .run(function (err, result) {
            if (err) {
                if (/file has not changed/.test(err)) {
                    log.warn(name + ': ' + err);
                } else if (/ENOENT/.test(err)) {
                    log.err('Failed to open file: ' + err.path);
                } else {
                    log.err(name + ': ' + err);
                }
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
        path.join(mod.buildDir, fileName, fileName + '.js')
    ])
        .log('coverage file read, starting coverage for: ' + fileName + '/' + fileName + '.js')
        .coverage({
            type: coverageType,
            charset: 'utf8',
            name: 'build/' + fileName + '/' + fileName + '.js'
        })
        .replace(replaceOptions)
        .check()
        .log('writing coverage file to ' + fileName + '/' + fileName + '-coverage.js')
        .write(path.join(mod.buildDir, fileName, fileName + '-coverage.js'))
        .run(function (err) {
            if (err) {
                log.err('coverage: ' + err);
            }
            callback();
        });

};

exports.coverage = buildCoverage;

var buildLang = function (mod, name, callback) {
    var langs = [''].concat(mod.config.lang),
        stack = new Stack();

    log.info('shifting ' + langs.length + ' langs for ' + name);

    langs.forEach(function (lang) {
        var queue = new Queue({
                logger: log,
                registry: registry
            }),
            modName = name + (lang ? '_' + lang : ''),
            fileName = modName + '.js',
            strings = fs.readFileSync(path.join(shifter.cwd(), 'lang', fileName), 'utf8');

        queue.read([path.join(__dirname, '../files/langtemplate.txt')])
            .replace(replaceOptions)
            .replace([
                {
                    regex: /@LANG_MODULE@/,
                    replace: 'lang/' + modName
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
            ]);

        queue[compressorFn](compressorConfig)
            .check()
            .write(path.join(mod.buildDir, name, 'lang', fileName))
            .run(stack.add(function (err) {
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
    var from = path.join(shifter.cwd(), 'assets'),
        to = path.join(mod.buildDir, name, 'assets');

    if (exists(from)) {
        log.info('shifting assets for ' + name);
        cpr(from, to, cprOptions, callback);
    } else {
        callback();
    }
};

var buildSkin = function (mod, name, callback) {
    log.info('shifting skin for ' + name);

    var stack = new Stack(),
        subMod = '',
        from = path.join(shifter.cwd(), 'assets'),
        to = path.join(mod.buildDir, name, 'assets');

    if (exists(path.join(shifter.cwd(), 'assets', name))) {
        log.info('found a subskin, shifting for ' + name);
        from = path.join(shifter.cwd(), 'assets', name);
        subMod = name;
    }

    if (exists(from)) {
        cpr(from, to, cprOptions, stack.add(function() {
            //Get list of Skins
            fs.readdir(path.join(shifter.cwd(), 'assets', subMod, 'skins'), stack.add(function (err, skins) {
                if (err) {
                    log.console.log(err);
                    log.err('skin files are not right!');
                    return;
                }

                //Walk the skins and write them out
                skins.forEach(function (skinName) {
                    if (skinName.indexOf('.') === 0) {
                        return;
                    }
                    //Write the full skin file with core
                    var queue = new Queue({
                        logger: log,
                        registry: registry
                    }),
                        base = path.join(shifter.cwd(), 'assets', subMod, 'skins', skinName);

                    queue.read([
                        path.resolve(base, '../../', name + '-core.css'),
                        path.join(base, name + '-skin.css')
                    ])
                        .log('copying assets to skin for ' + skinName)
                        .concat();
                    if (defaultLint && cssLint) {
                        queue.csslint(cssLintConfig);
                    }

                    queue.cssstamp({
                        stamp: '/* YUI CSS Detection Stamp */\n#yui3-css-stamp.skin-' + skinName + '-' + name + ' { display: none; }'
                    })
                        .replace(replaceOptions)
                        .cssproc({
                            url: mod.cssproc,
                            root: mod.buildDir,
                            file: path.join(mod.buildDir, name, 'assets', 'skins', skinName, name + '.css')
                        })
                        .cssmin()
                        .check()
                        .log('writing skin file with core wrapper')
                        .write(path.join(mod.buildDir, name, 'assets', 'skins', skinName, name + '.css'))
                        .run(stack.add(function (err) {
                            if (err) {
                                log.err(err);
                                if (err.code === 'ENOENT') {
                                    log.err('skin file is missing: ' + err.path);
                                    return;
                                }
                            }

                            //Write the skin file without core
                            var Rqueue = new Queue({
                                    logger: log,
                                    registry: registry
                                });

                            Rqueue.read([
                                path.join(base, name + '-skin.css')
                            ])
                                .check()
                                .cssproc({
                                    url: mod.cssproc,
                                    root: mod.buildDir,
                                    file: path.join(mod.buildDir, name, 'assets', 'skins', skinName, name + '-skin.css')
                                })
                                .log('writing skin file without core wrapper')
                                .write(path.join(mod.buildDir, name, 'assets', 'skins', skinName, name + '-skin.css'))
                                .run(stack.add(function () {
                                }));
                        }));
                });

            }));
        }));
    }

    stack.done(function () {
        callback();
    });

};

exports.skin = buildSkin;

var buildCopy = function (mod, name, callback) {
    log.info('shifting a copy');
    mod.copy.forEach(function (value, key) {
        mod.copy[key] = [
            path.join(shifter.cwd(), value[0]),
            path.join(mod.buildDir, name, value[1])
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
                cpr(from, to, cprOptions, function () {
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
                    fromS.pipe(toS);
                    fromS.once('end', copy);
                }
            }
        });
    };

    copy();

};

exports.copy = buildCopy;

var setReplacers = function (options) {
    var items = {};
    replaceOptions.forEach(function(item) {
        items[item.regex] = item;
    });
    replaceOptions = [];
    Object.keys(options).forEach(function (k) {
        var key, o;
        if (k.indexOf('replace-') === 0) {
            key = k.replace('replace-', '').toUpperCase();
            o = {
                regex: '@' + key + '@',
                replace: options[k]
            };
            if (items[o.regex]) {
                delete items[o.regex];
            }
            replaceOptions.push(o);
        }
    });
    Object.keys(items).forEach(function(k) {
        var o = items[k];
        replaceOptions.unshift(o);
    });
};

var build = function (mod, name, options, callback) {
    var stack = new Stack(), _build;

    if (options.lint === false) {
        defaultLint = options.lint;
    } else {
        if (options.lint === 'config') {
            defaultLint = fetchJSHintConfig();
        }
        if (!defaultLint) {
            defaultLint = lint.preferred;
        }
        setJSLint();
    }

    configCompressor(options);
    setReplacers(options);

    cacheBuild = options.cache;
    strictMode = (options.strict);
    cssLint = options.csslint;
    coverageType = (options.istanbul) ? 'istanbul' : 'yuitest';
    lintFail = options.fail;
    lintSTDError = options['lint-stderr'];
    mod.stamp = mod.shifter && typeof mod.shifter.jsstamp === 'boolean' ? mod.shifter.jsstamp : options.jsstamp;
    globalRegex = (typeof options.regex !== 'undefined') ? options.regex : globalRegex;

    _build = stack.add(function() {
        if ((mod.jsfiles && mod.jsfiles.length) || mod.yuifile) {
            exports.js(mod, name, stack.add(function (err) {
                if (err) {
                    log.warn('skipping coverage file build due to previous build error');
                } else {
                    if (options.coverage) {
                        exports.coverage(mod, name, stack.add(noop));
                    }
                    if (options.cssproc) {
                        mod.cssproc = options.cssproc;
                    }
                    if (options.assets) {
                        if ((mod.config && mod.config.skinnable) || mod.skinnable) {
                            exports.skin(mod, name, stack.add(noop));
                        } else if (mod.assets) {
                            copyAssets(mod, name, stack.add(noop));
                        }
                    }
                    if (mod.config && mod.config.lang) {
                        exports.lang(mod, name, stack.add(noop));
                    }
                }
            }));
        }
        if (mod.cssfiles && mod.cssfiles.length) {
            // if assets are allow for css modules, cssproc should be honored as well
            if (options.cssproc) {
                mod.cssproc = options.cssproc;
            }
            exports.css(mod, name, stack.add(function (err) {
                if (err) {
                    log.warn('skipping assets copy due to previous build error');
                } else {
                    if (options.assets && mod.assets) {
                        copyAssets(mod, name, stack.add(noop));
                    }
                }
            }));
        }

        if (mod.copy && mod.copy.length) {
            exports.copy(mod, name, stack.add(noop));
        }
    });

    if (options.clean) {
        log.info('deleting build dir: ' + path.join(mod.buildDir, name || mod.name));
        rimraf(path.join(mod.buildDir, name || mod.name), _build);
    } else {
        _build();
    }




    stack.done(function (errs) {
        log.errors(errs);
        if (!stack.complete) {
            stack.complete = true;
            if ((Array.isArray(errs) && errs.length) || errs) {
                return callback('error building ' + name);
            }
            callback();
        }
    });
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
        var p, child, other,
            cmdName = cmd.split(' ')[0];

        if (path.extname(cmdName) === '.js') {
            cmd = '"' + process.argv[0] + '" ' + cmd;
        } else {
            if (cmdName === 'shifter') {
                //Fixing the call to shifter..
                p = cmd.split(' ');
                p[0] = '"' + process.execPath + '" "' + util.shifter + '"';
                cmd = p.join(' ');
            } else {
                p = cmd.split(' ');
                try {
                    other  = which(p[0]);
                    if (other) {
                        p[0] = '"' + other + '"';
                        cmd = p.join(' ');
                    }
                    log.info(cmd);
                    log.warn('THIS MAY NOT BE CROSS PLATFORM!');
                } catch (e) {
                    log.err('failed to execute exec ' + cmd);
                    return;
                }
            }
        }
        child = _exec(cmd, {
            cwd: shifter.cwd(),
            stdio: 'inherit'
        }, stack.add(function (error, stdout, stderr) {
            if (stderr) {
                log.err('start stderr output from ' + cmd + '\n');
                log.console.error(stderr);
                log.err('end stderr output from ' + cmd);
            }
            if (stdout) {
                log.info('start stdout output from ' + cmd + '\n');
                log.console.log(stdout);
                log.info('end stdout output from ' + cmd);
            }
        }));
    });

    stack.done(callback);
};

exports.exec = exec;

exports.build = function (mod, name, options, callback) {

    mod.buildDir = options['build-dir'];

    var end = function (err) {
        if (mod.postexec) {
            exec(mod.postexec, name, callback);
        } else {
            callback(err);
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
        fileName = mod.basefilename || name,
        postfix = "@YUIGLOBALVAR@.add('" + modName + "', function (@YUIVAR@, NAME) {" +
            (options.strict ? '"use strict"; ' : "") + "}, '@VERSION@'" + stringify(mod.config) + ");\n",
        regex = (typeof mod.regex !== 'undefined') ? mod.regex : globalRegex,
        files = [];

    mod.files.forEach(function (file) {
        files.push(path.join(mod.buildDir, file, file + '-debug.js'));
    });

    queue.read(files)
        .concat()
        .jsstamp({
            postfix: postfix
        })
        .replace(replaceOptions)
        .log('writing rollup file ' + path.join(fileName, fileName + '-debug.js'))
        .check()
        .write(path.join(mod.buildDir, fileName, fileName + '-debug.js'));

    if (regex) {
        queue.replace({
            regex: regex
        }); // Strip Y.log's
    }

    if (defaultLint) {
        queue.jshint(jshintConfig);
    }

    queue.log('linting done, writing ' + path.join(fileName, fileName + '.js'))
        .check()
        .write(path.join(mod.buildDir, fileName, fileName + '.js'))
        .log('compressing ' + path.join(fileName, fileName + '.js with ' + cName[compressorFn]));

    queue[compressorFn](compressorConfig)
        .check()
        .log('compressing done, writing ' + path.join(fileName, fileName + '-min.js'))
        .write(path.join(mod.buildDir, fileName, fileName + '-min.js'))
        .run(function (err) {
            if (err) {
                return callback(name + ' rollup: ' + err);
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
        setReplacers(options);

        configCompressor(options);

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
