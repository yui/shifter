Shifter - Blazingly Fast YUI Builder
====================================

The purpose of this project is to replace YUI's use of our old ant [https://github.com/yui/builder](Builder).

We have out grown our old builder, so it was time to build a new one!

Usage
-----

Shifter will parse your current `*.properties` files and convert them into a `build.json` file that
it can process. It only imports the relevant settings required to build the module.

**It does not import module meta-data**

Instead, Shifter parses the meta-data from the modules `meta/*.json` files and uses that instead.
So you don't have to declare your meta-data in more than one place now.

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

Shifter is built using [http://gearjs.org/](GearJS)
