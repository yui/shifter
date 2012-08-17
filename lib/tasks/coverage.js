
var coverage = require('yuitest-coverage');

exports.coverage = function(options, blob, done) {
    options = options || {}; //Not needed here??

    coverage.cover(blob.result, options, function(err, data) {
        if (err) {
            done(err);
        } else {
            done(null, new blob.constructor(data, blob));
        }
    });
};
