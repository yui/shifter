/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

exports.jsstamp = function (options, blob, done) {
    var result, spaces, indent = '';
    options = options || {};

    options.prefix = options.prefix || '';
    options.postfix = options.postfix || '';

    if (options.strict) {
        //Find the first char position so we can inject "use strict"; at that point
        spaces = blob.result.split('\n')[0].split(' ');
        indent = '';

        spaces.forEach(function (ch) {
            if (ch === '') {
                indent += ' ';
            }
        });
        options.prefix += indent + '"use strict";\n';
    }

    result = options.prefix + blob.result + options.postfix;

    done(null, new blob.constructor(result, blob));
};
