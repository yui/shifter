var path = require('path'),
    fs = require('fs'),
    log = require('./log'),
    noop = function() {},
    timer = require('./timer'),
    Stack = require('./stack').Stack,
    module = require('./module');

exports.start = function(json) {
    log.info('putting the hammer down');
    var stack = new Stack(),
        start = new Date();

    Object.keys(json.builds).forEach(function(name) {
        log.info('shifting into gear for ' + name);
        var mod = json.builds[name];
        module.build(mod, name, stack.add(noop));
    });

    stack.done(function() {
        var end = new Date();
        log.info('done racing, the gears are toast');
        log.info('finished in ' + timer.calc(start, end) + ', pretty fast huh?');
    });
};

