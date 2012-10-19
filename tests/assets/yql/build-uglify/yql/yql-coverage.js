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
_yuitest_coverage["build/yql/yql.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/yql/yql.js",
    code: []
};
_yuitest_coverage["build/yql/yql.js"].code=["YUI.add('yql', function (Y, NAME) {","","","/*!","ENSURE THIS STAYS AT MIN TIME","Copyright 2012 Yahoo! Inc. All rights reserved.","Licensed under the BSD License.","http://yuilibrary.com/license/","*/","","    /**","     * This class adds a sugar class to allow access to YQL (http://developer.yahoo.com/yql/).","     * @module yql","     */","    /**","     * Utility Class used under the hood my the YQL class","     * @class YQLRequest","     * @constructor","     * @param {String} sql The SQL statement to execute","     * @param {Function/Object} callback The callback to execute after the query (Falls through to JSONP).","     * @param {Object} params An object literal of extra parameters to pass along (optional).","     * @param {Object} opts An object literal of configuration options (optional): proto (http|https), base (url)","     */","    var YQLRequest = function (sql, callback, params, opts) {","        this._types = {","            esc: {","                token: '\\uE000',","                re: /\\\\[:\\[\\]\\(\\)#\\.\\'\\>+~\"]/gi","            },","","            attr: {","                token: '\\uE001',","                re: /(\\[[^\\]]*\\])/g","            },","","            pseudo: {","                token: '\\uE002',","                re: /(\\([^\\)]*\\))/g","            }","        };","","        if (!params) {","            params = {};","        }","        params.q = sql;","        //Allow format override.. JSON-P-X","        if (!params.format) {","            params.format = Y.YQLRequest.FORMAT;","        }","        if (!params.env) {","            params.env = Y.YQLRequest.ENV;","        }","","        this._context = this;","","        if (opts && opts.context) {","            this._context = opts.context;","            delete opts.context;","        }","","        if (params && params.context) {","            this._context = params.context;","            delete params.context;","        }","","        this._params = params;","        this._opts = opts;","        this._callback = callback;","","    };","","    YQLRequest.prototype = {","        /**","        * @private","        * @property _jsonp","        * @description Reference to the JSONP instance used to make the queries","        */","        _jsonp: null,","        /**","        * @private","        * @property _opts","        * @description Holder for the opts argument","        */","        _opts: null,","        /**","        * @private","        * @property _callback","        * @description Holder for the callback argument","        */","        _callback: null,","        /**","        * @private","        * @property _params","        * @description Holder for the params argument","        */","        _params: null,","        /**","        * @private","        * @property _context","        * @description The context to execute the callback in","        */","        _context: null,","        /**","        * @private","        * @method _internal","        * @description Internal Callback Handler","        */","        _internal: function() {","            this._callback.apply(this._context, arguments);","        },","        /**","        * @method send","        * @description The method that executes the YQL Request.","        * @chainable","        * @return {YQLRequest}","        */","        send: function() {","            var qs = [], url = ((this._opts && this._opts.proto) ? this._opts.proto : Y.YQLRequest.PROTO),","            o;","","            Y.each(this._params, function(v, k) {","                qs.push(k + '=' + encodeURIComponent(v));","            });","","            qs = qs.join('&');","","            url += ((this._opts && this._opts.base) ? this._opts.base : Y.YQLRequest.BASE_URL) + qs;","","            o = (!Y.Lang.isFunction(this._callback)) ? this._callback : { on: { success: this._callback } };","","            o.on = o.on || {};","            this._callback = o.on.success;","","            o.on.success = Y.bind(this._internal, this);","","            if (o.allowCache !== false) {","                o.allowCache = true;","            }","","            if (!this._jsonp) {","                this._jsonp = Y.jsonp(url, o);","            } else {","                this._jsonp.url = url;","                if (o.on && o.on.success) {","                    this._jsonp._config.on.success = o.on.success;","                }","                this._jsonp.send();","            }","            return this;","        }","    };","","    /**","    * @static","    * @property FORMAT","    * @description Default format to use: json","    */","    YQLRequest.FORMAT = 'json';","    /**","    * @static","    * @property PROTO","    * @description Default protocol to use: http","    */","    YQLRequest.PROTO = 'http';","    /**","    * @static","    * @property BASE_URL","    * @description The base URL to query: query.yahooapis.com/v1/public/yql?","    */","    YQLRequest.BASE_URL = ':/'+'/query.yahooapis.com/v1/public/yql?';","    /**","    * @static","    * @property ENV","    * @description The environment file to load: http://datatables.org/alltables.env","    */","    YQLRequest.ENV = 'http:/'+'/datatables.org/alltables.env';","","    Y.YQLRequest = YQLRequest;","","    /**","     * This class adds a sugar class to allow access to YQL (http://developer.yahoo.com/yql/).","     * @class YQL","     * @constructor","     * @param {String} sql The SQL statement to execute","     * @param {Function} callback The callback to execute after the query (optional).","     * @param {Object} params An object literal of extra parameters to pass along (optional).","     * @param {Object} opts An object literal of configuration options (optional): proto (http|https), base (url)","     */","    Y.YQL = function(sql, callback, params, opts) {","        return new Y.YQLRequest(sql, callback, params, opts).send();","    };","","","","}, '1.2.3.4', {\"requires\": [\"jsonp\", \"jsonp-url\"]});"];
_yuitest_coverage["build/yql/yql.js"].lines = {"1":0,"24":0,"25":0,"42":0,"43":0,"45":0,"47":0,"48":0,"50":0,"51":0,"54":0,"56":0,"57":0,"58":0,"61":0,"62":0,"63":0,"66":0,"67":0,"68":0,"72":0,"109":0,"118":0,"121":0,"122":0,"125":0,"127":0,"129":0,"131":0,"132":0,"134":0,"136":0,"137":0,"140":0,"141":0,"143":0,"144":0,"145":0,"147":0,"149":0,"158":0,"164":0,"170":0,"176":0,"178":0,"189":0,"190":0};
_yuitest_coverage["build/yql/yql.js"].functions = {"YQLRequest:24":0,"_internal:108":0,"(anonymous 2):121":0,"send:117":0,"YQL:189":0,"(anonymous 1):1":0};
_yuitest_coverage["build/yql/yql.js"].coveredLines = 47;
_yuitest_coverage["build/yql/yql.js"].coveredFunctions = 6;
_yuitest_coverline("build/yql/yql.js", 1);
YUI.add('yql', function (Y, NAME) {


/*!
ENSURE THIS STAYS AT MIN TIME
Copyright 2012 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

    /**
     * This class adds a sugar class to allow access to YQL (http://developer.yahoo.com/yql/).
     * @module yql
     */
    /**
     * Utility Class used under the hood my the YQL class
     * @class YQLRequest
     * @constructor
     * @param {String} sql The SQL statement to execute
     * @param {Function/Object} callback The callback to execute after the query (Falls through to JSONP).
     * @param {Object} params An object literal of extra parameters to pass along (optional).
     * @param {Object} opts An object literal of configuration options (optional): proto (http|https), base (url)
     */
    _yuitest_coverfunc("build/yql/yql.js", "(anonymous 1)", 1);
_yuitest_coverline("build/yql/yql.js", 24);
var YQLRequest = function (sql, callback, params, opts) {
        _yuitest_coverfunc("build/yql/yql.js", "YQLRequest", 24);
_yuitest_coverline("build/yql/yql.js", 25);
this._types = {
            esc: {
                token: '\uE000',
                re: /\\[:\[\]\(\)#\.\'\>+~"]/gi
            },

            attr: {
                token: '\uE001',
                re: /(\[[^\]]*\])/g
            },

            pseudo: {
                token: '\uE002',
                re: /(\([^\)]*\))/g
            }
        };

        _yuitest_coverline("build/yql/yql.js", 42);
if (!params) {
            _yuitest_coverline("build/yql/yql.js", 43);
params = {};
        }
        _yuitest_coverline("build/yql/yql.js", 45);
params.q = sql;
        //Allow format override.. JSON-P-X
        _yuitest_coverline("build/yql/yql.js", 47);
if (!params.format) {
            _yuitest_coverline("build/yql/yql.js", 48);
params.format = Y.YQLRequest.FORMAT;
        }
        _yuitest_coverline("build/yql/yql.js", 50);
if (!params.env) {
            _yuitest_coverline("build/yql/yql.js", 51);
params.env = Y.YQLRequest.ENV;
        }

        _yuitest_coverline("build/yql/yql.js", 54);
this._context = this;

        _yuitest_coverline("build/yql/yql.js", 56);
if (opts && opts.context) {
            _yuitest_coverline("build/yql/yql.js", 57);
this._context = opts.context;
            _yuitest_coverline("build/yql/yql.js", 58);
delete opts.context;
        }

        _yuitest_coverline("build/yql/yql.js", 61);
if (params && params.context) {
            _yuitest_coverline("build/yql/yql.js", 62);
this._context = params.context;
            _yuitest_coverline("build/yql/yql.js", 63);
delete params.context;
        }

        _yuitest_coverline("build/yql/yql.js", 66);
this._params = params;
        _yuitest_coverline("build/yql/yql.js", 67);
this._opts = opts;
        _yuitest_coverline("build/yql/yql.js", 68);
this._callback = callback;

    };

    _yuitest_coverline("build/yql/yql.js", 72);
YQLRequest.prototype = {
        /**
        * @private
        * @property _jsonp
        * @description Reference to the JSONP instance used to make the queries
        */
        _jsonp: null,
        /**
        * @private
        * @property _opts
        * @description Holder for the opts argument
        */
        _opts: null,
        /**
        * @private
        * @property _callback
        * @description Holder for the callback argument
        */
        _callback: null,
        /**
        * @private
        * @property _params
        * @description Holder for the params argument
        */
        _params: null,
        /**
        * @private
        * @property _context
        * @description The context to execute the callback in
        */
        _context: null,
        /**
        * @private
        * @method _internal
        * @description Internal Callback Handler
        */
        _internal: function() {
            _yuitest_coverfunc("build/yql/yql.js", "_internal", 108);
_yuitest_coverline("build/yql/yql.js", 109);
this._callback.apply(this._context, arguments);
        },
        /**
        * @method send
        * @description The method that executes the YQL Request.
        * @chainable
        * @return {YQLRequest}
        */
        send: function() {
            _yuitest_coverfunc("build/yql/yql.js", "send", 117);
_yuitest_coverline("build/yql/yql.js", 118);
var qs = [], url = ((this._opts && this._opts.proto) ? this._opts.proto : Y.YQLRequest.PROTO),
            o;

            _yuitest_coverline("build/yql/yql.js", 121);
Y.each(this._params, function(v, k) {
                _yuitest_coverfunc("build/yql/yql.js", "(anonymous 2)", 121);
_yuitest_coverline("build/yql/yql.js", 122);
qs.push(k + '=' + encodeURIComponent(v));
            });

            _yuitest_coverline("build/yql/yql.js", 125);
qs = qs.join('&');

            _yuitest_coverline("build/yql/yql.js", 127);
url += ((this._opts && this._opts.base) ? this._opts.base : Y.YQLRequest.BASE_URL) + qs;

            _yuitest_coverline("build/yql/yql.js", 129);
o = (!Y.Lang.isFunction(this._callback)) ? this._callback : { on: { success: this._callback } };

            _yuitest_coverline("build/yql/yql.js", 131);
o.on = o.on || {};
            _yuitest_coverline("build/yql/yql.js", 132);
this._callback = o.on.success;

            _yuitest_coverline("build/yql/yql.js", 134);
o.on.success = Y.bind(this._internal, this);

            _yuitest_coverline("build/yql/yql.js", 136);
if (o.allowCache !== false) {
                _yuitest_coverline("build/yql/yql.js", 137);
o.allowCache = true;
            }

            _yuitest_coverline("build/yql/yql.js", 140);
if (!this._jsonp) {
                _yuitest_coverline("build/yql/yql.js", 141);
this._jsonp = Y.jsonp(url, o);
            } else {
                _yuitest_coverline("build/yql/yql.js", 143);
this._jsonp.url = url;
                _yuitest_coverline("build/yql/yql.js", 144);
if (o.on && o.on.success) {
                    _yuitest_coverline("build/yql/yql.js", 145);
this._jsonp._config.on.success = o.on.success;
                }
                _yuitest_coverline("build/yql/yql.js", 147);
this._jsonp.send();
            }
            _yuitest_coverline("build/yql/yql.js", 149);
return this;
        }
    };

    /**
    * @static
    * @property FORMAT
    * @description Default format to use: json
    */
    _yuitest_coverline("build/yql/yql.js", 158);
YQLRequest.FORMAT = 'json';
    /**
    * @static
    * @property PROTO
    * @description Default protocol to use: http
    */
    _yuitest_coverline("build/yql/yql.js", 164);
YQLRequest.PROTO = 'http';
    /**
    * @static
    * @property BASE_URL
    * @description The base URL to query: query.yahooapis.com/v1/public/yql?
    */
    _yuitest_coverline("build/yql/yql.js", 170);
YQLRequest.BASE_URL = ':/'+'/query.yahooapis.com/v1/public/yql?';
    /**
    * @static
    * @property ENV
    * @description The environment file to load: http://datatables.org/alltables.env
    */
    _yuitest_coverline("build/yql/yql.js", 176);
YQLRequest.ENV = 'http:/'+'/datatables.org/alltables.env';

    _yuitest_coverline("build/yql/yql.js", 178);
Y.YQLRequest = YQLRequest;

    /**
     * This class adds a sugar class to allow access to YQL (http://developer.yahoo.com/yql/).
     * @class YQL
     * @constructor
     * @param {String} sql The SQL statement to execute
     * @param {Function} callback The callback to execute after the query (optional).
     * @param {Object} params An object literal of extra parameters to pass along (optional).
     * @param {Object} opts An object literal of configuration options (optional): proto (http|https), base (url)
     */
    _yuitest_coverline("build/yql/yql.js", 189);
Y.YQL = function(sql, callback, params, opts) {
        _yuitest_coverfunc("build/yql/yql.js", "YQL", 189);
_yuitest_coverline("build/yql/yql.js", 190);
return new Y.YQLRequest(sql, callback, params, opts).send();
    };



}, '1.2.3.4', {"requires": ["jsonp", "jsonp-url"]});
