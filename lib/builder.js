var Queue = require('gear').Queue,
    Registry = require('gear').Registry,
    path = require('path'),
    tasks = require('./tasks'),
    fs = require('fs'),
    log = require('./log'),
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

var buildCSS = function(mod, name) {
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
    });

};

var buildJS = function(mod, name) {
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
    });

};

var buildCoverage = function(mod, name) {
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
    });

};

var buildLang = function(mod, name) {
    
    var langs = mod.config.lang;

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
        .run(function(err, result) {
            if (err) {
                log.err(err);
            } else {
                log.info('shifted lang for ' + name);
            }
        });

    });

};

var buildSkin = function(mod, name) {

    //Write core file
    var queue = new Queue({
            registry: registry
    }).read([path.join(process.cwd(), 'assets', name + '-core.css')])
    .write(path.join(buildDir, name, 'assets', name + '-core.css'))
    .run();

    
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
            .run(function() {
            });

            //Write the skin file without core
            var Rqueue = new Queue({
                registry: registry
            });
            
            Rqueue.read([
                path.join(base, name + '-skin.css')
            ])
            .write(path.join(buildDir, name, 'assets', 'skins', skinName, name + '-skin.css'))
            .run(function() {
            });


        });


    });


};


exports.start = function(json) {
    log.info('starting build');
    Object.keys(json.builds).forEach(function(name) {
        log.info('shifting into gear for ' + name);
        var mod = json.builds[name];
        if (mod.jsfiles) {
            buildJS(mod, name);
            buildCoverage(mod, name);
        }
        if (mod.cssfiles) {
            buildCSS(mod, name);
        }
        if (mod.config.skinnable) {
            log.warn('BUILD SKIN FOR: ' + name);
            buildSkin(mod, name);
        }
        if (mod.config.lang) {
            buildLang(mod, name);
        }
    });
};

