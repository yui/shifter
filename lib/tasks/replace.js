/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

exports.replace = function (items, blob, done) {

    var output = blob.result;

    if (!Array.isArray(items)) {
        items = [items];
    }

    items.forEach(function (params) {
        var replace  = params.replace || '',
            flags = params.flags || 'mg',
            regex = params.regex instanceof RegExp ? params.regex : new RegExp(params.regex, flags);

        output = output.replace(regex, replace);
    });

    done(null, new blob.constructor(output, blob));
};

