/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var Stack = require('./stack').Stack,
    path = require('path'),
    fs = require('fs'),
    log = require('./log'),
    noop = function() {},
    tasks = require('./tasks'),
    Queue = require('gear').Queue,
    Registry = require('gear').Registry,
    registry;

registry = new Registry({
    dirname: path.resolve(__dirname, '../', 'node_modules', 'gear-lib', 'lib')
});


registry.load({
    tasks: tasks
});

var resolve = function(items, dir) {
    var i = [];
    if (!Array.isArray(items)) {
        return null;
    }
    items.forEach(function(file, key) {
        var d = dir;
        if (file.indexOf(d) === 0 || file.indexOf('./' + d) === 0) {
            d = '';
        }
        i[key] = path.join(process.cwd(), d, file);
    });
    return i;
};

var buildDir = path.join(process.cwd(), '../../build');

exports.buildDir = buildDir;

var buildCSS = function(mod, name, callback) {
    var queue = new Queue({
        registry: registry
    });
    
    queue.read(resolve(mod.cssfiles, 'css'))
    .cssstamp({
        stamp: '/* YUI CSS Detection Stamp */\n#yui3-css-stamp.' + name + ' { display: none; }'
    })
    .write(path.join(buildDir, name, name + '.css'))
    .compressor({
        'line-break': 6000,
        type: 'css'
    })
    .write(path.join(buildDir, name, name + '-min.css'))
    .run(function(err, result) {
        if (err) {
            log.err('css: ' + err);
        } else {
            //log.info('shifted up');
        }
        callback();
    });

};

exports.css = buildCSS;

var loggerRegex = /^.*?(?:logger|Y.log).*?(?:;|\).*;|(?:\r?\n.*?)*?\).*;).*;?.*?\r?\n/mg;

exports.loggerRegex = loggerRegex;

var buildJS = function(mod, name, callback) {
    
    var queue = new Queue({
        registry: registry
    });
    
    queue.read(resolve(mod.jsfiles, 'js'))
    .concat()
    .jsstamp({
        prefix: "YUI.add('" + name + "', function(Y) {\n\n",
        postfix: "\n\n}, '@VERSION@' ," + JSON.stringify(mod.config) + ");\n"
    })
    .wrap({
        prepend: resolve(mod.prependfiles, 'js'),
        append: resolve(mod.appendfiles, 'js')
    })
    .write(path.join(buildDir, name, name + '-debug.js'));
    
    var regex = (typeof mod.regex !== 'undefined') ? mod.regex : loggerRegex;
    if (regex) {
        queue.replace({
            regex: regex
        }); // Strip Y.log's
    }
    queue.write(path.join(buildDir, name, name + '.js'))
    .compressor({
        'disable-optimizations': true,
        'preserve-semi': true,
        'line-break': 6000
    })
    .write(path.join(buildDir, name, name + '-min.js'))
    .run(function(err, result) {
        if (err) {
            log.err('js: ' + err);
        } else {
            //log.info('shifted up');
        }
        callback();
    });

};

exports.js = buildJS;

var buildCoverage = function(mod, name, callback) {
    var queue = new Queue({
        registry: registry
    });
    
    queue.read(resolve(mod.jsfiles, 'js'))
    .concat()
    .jsstamp({
        prefix: "YUI.add('" + name + "', function(Y) {\n\n",
        postfix: "\n\n}, '@VERSION@' ," + JSON.stringify(mod.config) + ");\n"
    });

    var regex = (typeof mod.regex !== 'undefined') ? mod.regex : loggerRegex;
    if (regex) {
        queue.replace({
            regex: regex
        }); // Strip Y.log's
    }

    queue.coverage({
        charset: 'utf8',
        name: name
    })
    .write(path.join(buildDir, name, name + '-coverage.js'))
    .run(function(err, result) {
        if (err) {
            log.err('coverage: ' + err);
        } else {
            //log.info('shifted up');
        }
        callback();
    });

};

exports.coverage = buildCoverage;

var buildLang = function(mod, name, callback) {
    
    var langs = mod.config.lang,
        stack = new Stack();

    langs.unshift('');

    langs.forEach(function(lang) {
        var queue = new Queue({
                registry: registry
            }),
            modName = name + (lang ? '_' + lang : ''),
            fileName = modName + '.js',
            strings = fs.readFileSync(path.join(process.cwd(), 'lang', fileName), 'utf8');

        queue.read([path.join(__dirname, '../files/langtemplate.txt')])
        .replace({
            regex: /@LANG_MODULE@/,
            replace: 'lang/' + modName
        })
        .replace({
            regex: /@YUIVAR@/,
            replace: 'Y'
        })
        .replace({
            regex: /@MODULE@/,
            replace: name
        })
        .replace({
            regex: /@LANG@/,
            replace: lang
        })
        .replace({
            regex: /@STRINGS@/,
            replace: strings
        })
        .replace({
            regex: /@LANG_DETAILS@/,
            replace: ''
        })
        .compressor({
            'disable-optimizations': true,
            'preserve-semi': true,
            'line-break': 6000
        })
        .write(path.join(buildDir, name, 'lang', fileName))
        .run(stack.add(function(err, result) {
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

var buildSkin = function(mod, name, callback) {
    
    var stack = new Stack();

    //Write core file
    var queue = new Queue({
            registry: registry
    }).read([path.join(process.cwd(), 'assets', name + '-core.css')])
    .write(path.join(buildDir, name, 'assets', name + '-core.css'))
    .run(stack.add(function() {}));

    
    //Get list of Skins
    fs.readdir(path.join(process.cwd(), 'assets/skins'), function(err, skins) {

        //Walk the skins and write them out
        skins.forEach(function(skinName) {
            
            //Write the full skin file with core
            var queue = new Queue({
                registry: registry
            });
            
            var base = path.join(process.cwd(), 'assets/skins/', skinName);

            queue.read([
                path.resolve(base, '../', name + '-core.css'),
                path.join(base, name + '-skin.css')
            ])
            .compressor({
                'line-break': 6000,
                type: 'css'
            })
            .cssstamp({
                stamp: '/* YUI CSS Detection Stamp */\n#yui3-css-stamp.skin-' + skinName + '-' + name + ' { display: none; }'
            })
            .write(path.join(buildDir, name, 'assets', 'skins', skinName, name + '.css'))
            .run(stack.add(function() {
            }));

            //Write the skin file without core
            var Rqueue = new Queue({
                registry: registry
            });
            
            Rqueue.read([
                path.join(base, name + '-skin.css')
            ])
            .write(path.join(buildDir, name, 'assets', 'skins', skinName, name + '-skin.css'))
            .run(stack.add(function() {
            }));


        });


    });

    stack.done(callback);

};

exports.skin = buildSkin;


var build = function(mod, name, callback) {
    var stack = new Stack();

    if (mod.jsfiles) {
        exports.js(mod, name, stack.add(noop));
        exports.coverage(mod, name, stack.add(noop));
    }
    if (mod.cssfiles) {
        exports.css(mod, name, stack.add(noop));
    }
    if (mod.config.skinnable) {
        exports.skin(mod, name, stack.add(noop));
    }
    if (mod.config.lang) {
        exports.lang(mod, name, stack.add(noop));
    }

    stack.done(callback);
};

exports.build = build;
