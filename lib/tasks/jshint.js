var jshint = require('jshint').JSHINT;

exports.jshint = function (options, blob, done) {
    options = options || {};

    var source = blob.result,
        config = options.config,
        callback = options.callback,
        result = jshint(source, config),
        errors = null,
        linted = null;
    
    if (!result) {
        errors = jshint.errors;
    }

    linted = errors ? new blob.constructor(blob, { jshint: errors }) : blob;
    done(callback ? callback(linted) : null, linted);
};
