/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
exports.calc = function(start, end) {
    var total = end - start,
        diff = {}, str = '';

    diff.seconds_raw = (total/1000);

    diff.days = Math.floor(total/1000/60/60/24);
    total -= diff.days*1000*60*60*24;

    diff.hours = Math.floor(total/1000/60/60);
    total -= diff.hours*1000*60*60;

    diff.minutes = Math.floor(total/1000/60);
    total -= diff.minutes*1000*60;

    diff.seconds = Math.floor(total/1000);

    if (diff.hours) {
        str = diff.hours + ' hours, ' + diff.minutes + ' minutes, ' + diff.seconds + ' seconds';
    } else if (diff.minutes) {
        str = diff.minutes + ' minutes, ' + diff.seconds + ' seconds';
    } else {
        str = diff.seconds_raw + ' seconds';
    }

    return str;
};
