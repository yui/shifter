Shifter - Blazingly Fast YUI Builder
====================================

The purpose of this project is to replace YUI's use of our old ant [Builder](https://github.com/yui/builder).

We have out grown our old builder, so it was time to build a new one!

Linting
-------

As of `0.1.0`, [JSHint](http://jshint.com/) is the default lint tool used by `shifter`. We maintain a
list of our lint preferences in the [yui-lint](https://github.com/yui/yui-lint) project. `shifter` will
default to our rules unless `--lint config` is passed. Then it will search up the file tree and attempt
to load your custom `.jshintrc` file.

Documentation
-------------

[Documentation can be found here](http://yui.github.com/shifter/)

Build Status
------------

[![Build Status](https://secure.travis-ci.org/yui/shifter.png?branch=master)](http://travis-ci.org/yui/shifter)

Install
-------

    npm -g install shifter

Some Options
------------

More detail can be found in the [documentation](http://yui.github.com/shifter/)

    $ shifter -h

    blazingly fast builds with shifter

    pass no arguments and shifter will build the module from the current directory

       -v/--version            show version
       -h/--help               show this stuff
       -m/--modules <module>   limit the modules to build (array: -m foo -m bar)
       --strict                add "use strict" to module wrapper
       --walk                  Walk the current directory and shift all builds. (cd yui3/src && shifter --walk)
                                   -m/--modules also supported here for filtering
       --watch                 Watch the current module and rebuild on file change (if meta file, a loader build will launch)
                                   --quiet to mute stdout from sub build

Usage
-----

Shifter will parse your current `*.properties` files and convert them into a `build.json` file that
it can process. It only imports the relevant settings required to build the module.

**It does not import module meta-data**

Instead, Shifter parses the meta-data from the modules `meta/*.json` files and uses that instead.
So you don't have to declare your meta-data in more than one place now.

Watching
--------

Shifter can watch your module for changes and build for you. It will only watch files in the
`./js`, `./css`, `./assets` and `./meta` directories. If a file is changed, it will rebuild the current
module. If a meta file is changes, `Loader` will also be built (*requires latest code*).


Migrating
---------

Shifter is designed to work side by side with our current builder (for now) so you don't have to
switch over to using it fully if it doesn't work properly for you. Just don't delete your `*.properties`
files until you are sure that Shifter builds your module properly. If it doesn't, file a ticket and
we'll get it fixed up ASAP.

Shifter will read a `build.json` file if it exists, if one doesn't and it finds a `*.properties` file
it will generate the `build.json` from them. So if you have issues with the build, just delete the `build.json`
file and have Shifter regenerate it after your issue is fixed.


GearJS
------

Shifter is built using [GearJS](http://gearjs.org/)
