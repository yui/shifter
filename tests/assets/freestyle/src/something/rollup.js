/* shifter should be able to split this up into separate modules */

YUI.add('bar', function (Y, NAME) {
    Y[NAME] = 1;
}, 'something', { requires: ['foo'] });

YUI.add('baz', function (Y, NAME) {
    Y[NAME] = 2;
}, 'something', { requires: ['bar'] });
