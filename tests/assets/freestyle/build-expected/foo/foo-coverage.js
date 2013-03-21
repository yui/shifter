if (typeof _yuitest_coverage == "undefined"){
    _yuitest_coverage = {};
    _yuitest_coverline = function(src, line){
        var coverage = _yuitest_coverage[src];
        if (!coverage.lines[line]){
            coverage.calledLines++;
        }
        coverage.lines[line]++;
    };
    _yuitest_coverfunc = function(src, name, line){
        var coverage = _yuitest_coverage[src],
            funcId = name + ":" + line;
        if (!coverage.functions[funcId]){
            coverage.calledFunctions++;
        }
        coverage.functions[funcId]++;
    };
}
_yuitest_coverage["build/foo/foo.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/foo/foo.js",
    code: []
};
_yuitest_coverage["build/foo/foo.js"].code=["YUI.add('foo', function (Y, NAME) {","    Y[NAME] = 1;","}, '@VERSION@', {\"requires\": [\"bar\"]});"];
_yuitest_coverage["build/foo/foo.js"].lines = {"1":0,"2":0};
_yuitest_coverage["build/foo/foo.js"].functions = {"(anonymous 1):1":0};
_yuitest_coverage["build/foo/foo.js"].coveredLines = 2;
_yuitest_coverage["build/foo/foo.js"].coveredFunctions = 1;
_yuitest_coverline("build/foo/foo.js", 1);
YUI.add('foo', function (Y, NAME) {
    _yuitest_coverfunc("build/foo/foo.js", "(anonymous 1)", 1);
_yuitest_coverline("build/foo/foo.js", 2);
Y[NAME] = 1;
}, '@VERSION@', {"requires": ["bar"]});
