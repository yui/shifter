
exports.jsstamp = function(options, blob, done) {
    options = options || {};

    options.prefix = options.prefix || '';
    options.postfix = options.postfix || '';

    var result = options.prefix + blob.result + options.postfix;

    done(null, new blob.constructor(result, blob));
};
