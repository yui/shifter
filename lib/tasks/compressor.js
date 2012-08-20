/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
var compressor = require('yuicompressor');
var path = require('path');
var jar = path.join(__dirname, '../../', 'files', 'yuicompressor-2.4.7.jar');

compressor.jar = jar;

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
