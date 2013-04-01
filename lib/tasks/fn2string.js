/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var vm = require('vm'),
    contextForRunInContext = vm.createContext({
        require: require,
        module: require('module'),
        console: {
            log: function () {}
        },
        window: {},
        document: {},
        YUI: null
    });

exports.fn2string = function (options, blob, done) {
    var moduleFn;
    contextForRunInContext.YUI = {
        add: function (name, fn) {
            if (name === options.name) {
                moduleFn = fn;
            }
        }
    };
    try {
        vm.runInContext(blob.result, contextForRunInContext, options.path);
    } catch (e) {
        return done(new Error('invalid yui module on ' + options.path + '.'));
    }
    if (moduleFn) {
        done(null, new blob.constructor(moduleFn.toString(), blob));
    } else {
        done(new Error('unable to locate module `' + options.name + '` on `' + options.path + '`.'));
    }
};
