

exports.cssstamp = function(options, blob, done) {
    options = options || {};

    options.stamp = options.stamp || '';

    var result = blob.result + options.stamp + '\n';

    done(null, new blob.constructor(result, blob));
};
