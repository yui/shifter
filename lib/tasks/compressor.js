
var compressor = require('yuicompressor');

exports.compressor = function(options, blob, done) {
    options = options || {};

    compressor.compress(blob.result, options, function(err, data) {
        if (err) {
            done(err);
        } else {
            done(null, new blob.constructor(data, blob));
        }
    });
};
