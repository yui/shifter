var Queue = require('gear').Queue,
    Registry = require('gear').Registry,
    path = require('path'),
    tasks = require('./tasks'),
    fs = require('fs'),
    log = require('./log'),
    timer = require('./timer'),
    Stack = require('./stack').Stack,
    registry;

registry = new Registry({
    dirname: path.resolve(__dirname, '../', 'node_modules', 'gear-lib', 'lib')
});


registry.load({
    tasks: tasks
});

var resolve = function(items, dir) {
    var i = [];
    items.forEach(function(file, key) {
        i[key] = path.join(process.cwd(), dir, file);
    });
    return i;
};

var buildDir = path.join(process.cwd(), '../../build');

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
            log.err(err);
        } else {
            //log.info('shifted up');
        }
        callback();
    });

};

var buildJS = function(mod, name, callback) {
    
    var queue = new Queue({
        registry: registry
    });
    
    queue.read(resolve(mod.jsfiles, 'js'))
    .concat({
        callback: function(blob) {
            var prefix = "YUI.add('" + name + "', function(Y) {\n\n",
            postfix = "\n\n}, '@VERSION@' ," + JSON.stringify(mod.config) + ");\n";
            return prefix + blob.result + postfix;
        }
    })
    .write(path.join(buildDir, name, name + '-debug.js'))
    .replace({regex: /^.*?(?:logger|Y.log).*?(?:;|\).*;|(?:\r?\n.*?)*?\).*;).*;?.*?\r?\n/mg}) // Strip Y.log's
    .write(path.join(buildDir, name, name + '.js'))
    .compressor({
        'disable-optimizations': true,
        'preserve-semi': true,
        'line-break': 6000
    })
    .write(path.join(buildDir, name, name + '-min.js'))
    .run(function(err, result) {
        if (err) {
            log.err(err);
        } else {
            //log.info('shifted up');
        }
        callback();
    });

};

var buildCoverage = function(mod, name, callback) {
    var queue = new Queue({
        registry: registry
    });
    
    queue.read(resolve(mod.jsfiles, 'js'))
    .concat({
        callback: function(blob) {
            var prefix = "YUI.add('" + name + "-coverage', function(Y) {\n\n",
            postfix = "\n\n}, '@VERSION@' ," + JSON.stringify(mod.config) + ");\n";
            return prefix + blob.result + postfix;
        }
    })
    .replace({regex: /^.*?(?:logger|Y.log).*?(?:;|\).*;|(?:\r?\n.*?)*?\).*;).*;?.*?\r?\n/mg}) // Strip Y.log's
    .coverage({
        charset: 'utf8',
        name: name
    })
    .write(path.join(buildDir, name, name + '-coverage.js'))
    .run(function(err, result) {
        if (err) {
            log.err(err);
        } else {
            //log.info('shifted up');
        }
        callback();
    });

};

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
                log.err(err);
            } else {
                log.info('shifted lang for ' + name);
            }
        }));

    });

    stack.done(callback);

};

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


exports.start = function(json) {
    log.info('putting the hammer down');
    var stack = new Stack(),
        start = new Date(),
        noop = function() {};

    Object.keys(json.builds).forEach(function(name) {
        log.info('shifting into gear for ' + name);
        var mod = json.builds[name];
        if (mod.jsfiles) {
            buildJS(mod, name, stack.add(noop));
            buildCoverage(mod, name, stack.add(noop));
        }
        if (mod.cssfiles) {
            buildCSS(mod, name, stack.add(noop));
        }
        if (mod.config.skinnable) {
            buildSkin(mod, name, stack.add(noop));
        }
        if (mod.config.lang) {
            buildLang(mod, name, stack.add(noop));
        }
    });

    stack.done(function() {
        var end = new Date();
        log.info('done racing, the gears are toast');
        log.info('finished in ' + timer.calc(start, end) + ', pretty fast huh?');
    });
};

