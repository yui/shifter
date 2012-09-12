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
_yuitest_coverage["build/yql/yql.js"].code=["YUI.add('yql', function (Y, NAME) {","","","/*!","ENSURE THIS STAYS AT MIN TIME","Copyright 2012 Yahoo! Inc. All rights reserved.","Licensed under the BSD License.","http://yuilibrary.com/license/","*/","","    /**","     * This class adds a sugar class to allow access to YQL (http://developer.yahoo.com/yql/).","     * @module yql","     */     ","    /**","     * Utility Class used under the hood my the YQL class","     * @class YQLRequest","     * @constructor","     * @param {String} sql The SQL statement to execute","     * @param {Function/Object} callback The callback to execute after the query (Falls through to JSONP).","     * @param {Object} params An object literal of extra parameters to pass along (optional).","     * @param {Object} opts An object literal of configuration options (optional): proto (http|https), base (url)","     */","    var YQLRequest = function (sql, callback, params, opts) {","        ","        if (!params) {","            params = {};","        }","        params.q = sql;","        //Allow format override.. JSON-P-X","        if (!params.format) {","            params.format = Y.YQLRequest.FORMAT;","        }","        if (!params.env) {","            params.env = Y.YQLRequest.ENV;","        }","","        this._context = this;","","        if (opts && opts.context) {","            this._context = opts.context;","            delete opts.context;","        }","        ","        if (params && params.context) {","            this._context = params.context;","            delete params.context;","        }","        ","        this._params = params;","        this._opts = opts;","        this._callback = callback;","","    };","    ","    YQLRequest.prototype = {","        /**","        * @private","        * @property _jsonp","        * @description Reference to the JSONP instance used to make the queries","        */","        _jsonp: null,","        /**","        * @private","        * @property _opts","        * @description Holder for the opts argument","        */","        _opts: null,","        /**","        * @private","        * @property _callback","        * @description Holder for the callback argument","        */","        _callback: null,","        /**","        * @private","        * @property _params","        * @description Holder for the params argument","        */","        _params: null,","        /**","        * @private","        * @property _context","        * @description The context to execute the callback in","        */","        _context: null,","        /**","        * @private","        * @method _internal","        * @description Internal Callback Handler","        */","        _internal: function() {","            this._callback.apply(this._context, arguments);","        },","        /**","        * @method send","        * @description The method that executes the YQL Request.","        * @chainable","        * @return {YQLRequest}","        */","        send: function() {","            var qs = [], url = ((this._opts && this._opts.proto) ? this._opts.proto : Y.YQLRequest.PROTO);","","            Y.each(this._params, function(v, k) {","                qs.push(k + '=' + encodeURIComponent(v));","            });","","            qs = qs.join('&');","            ","            url += ((this._opts && this._opts.base) ? this._opts.base : Y.YQLRequest.BASE_URL) + qs;","            ","            var o = (!Y.Lang.isFunction(this._callback)) ? this._callback : { on: { success: this._callback } };","","            o.on = o.on || {};","            this._callback = o.on.success;","","            o.on.success = Y.bind(this._internal, this);","","            if (o.allowCache !== false) {","                o.allowCache = true;","            }","            ","            if (!this._jsonp) {","                this._jsonp = Y.jsonp(url, o);","            } else {","                this._jsonp.url = url;","                if (o.on && o.on.success) {","                    this._jsonp._config.on.success = o.on.success;","                }","                this._jsonp.send();","            }","            return this;","        }","    };","","    /**","    * @static","    * @property FORMAT","    * @description Default format to use: json","    */","    YQLRequest.FORMAT = 'json';","    /**","    * @static","    * @property PROTO","    * @description Default protocol to use: http","    */","    YQLRequest.PROTO = 'http';","    /**","    * @static","    * @property BASE_URL","    * @description The base URL to query: query.yahooapis.com/v1/public/yql?","    */","    YQLRequest.BASE_URL = ':/'+'/query.yahooapis.com/v1/public/yql?';","    /**","    * @static","    * @property ENV","    * @description The environment file to load: http://datatables.org/alltables.env","    */","    YQLRequest.ENV = 'http:/'+'/datatables.org/alltables.env';","    ","    Y.YQLRequest = YQLRequest;","	","    /**","     * This class adds a sugar class to allow access to YQL (http://developer.yahoo.com/yql/).","     * @class YQL","     * @constructor","     * @param {String} sql The SQL statement to execute","     * @param {Function} callback The callback to execute after the query (optional).","     * @param {Object} params An object literal of extra parameters to pass along (optional).","     * @param {Object} opts An object literal of configuration options (optional): proto (http|https), base (url)","     */","	Y.YQL = function(sql, callback, params, opts) {","        return new Y.YQLRequest(sql, callback, params, opts).send();","    };","","","","}, '@VERSION@', {\"requires\": [\"jsonp\", \"jsonp-url\"]});"];
_yuitest_coverage["build/yql/yql.js"].lines = {"1":0,"24":0,"26":0,"27":0,"29":0,"31":0,"32":0,"34":0,"35":0,"38":0,"40":0,"41":0,"42":0,"45":0,"46":0,"47":0,"50":0,"51":0,"52":0,"56":0,"93":0,"102":0,"104":0,"105":0,"108":0,"110":0,"112":0,"114":0,"115":0,"117":0,"119":0,"120":0,"123":0,"124":0,"126":0,"127":0,"128":0,"130":0,"132":0,"141":0,"147":0,"153":0,"159":0,"161":0,"172":0,"173":0};
_yuitest_coverage["build/yql/yql.js"].functions = {"YQLRequest:24":0,"_internal:92":0,"(anonymous 2):104":0,"send:101":0,"YQL:172":0,"(anonymous 1):1":0};
_yuitest_coverage["build/yql/yql.js"].coveredLines = 46;
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
_yuitest_coverline("build/yql/yql.js", 26);
if (!params) {
            _yuitest_coverline("build/yql/yql.js", 27);
params = {};
        }
        _yuitest_coverline("build/yql/yql.js", 29);
params.q = sql;
        //Allow format override.. JSON-P-X
        _yuitest_coverline("build/yql/yql.js", 31);
if (!params.format) {
            _yuitest_coverline("build/yql/yql.js", 32);
params.format = Y.YQLRequest.FORMAT;
        }
        _yuitest_coverline("build/yql/yql.js", 34);
if (!params.env) {
            _yuitest_coverline("build/yql/yql.js", 35);
params.env = Y.YQLRequest.ENV;
        }

        _yuitest_coverline("build/yql/yql.js", 38);
this._context = this;

        _yuitest_coverline("build/yql/yql.js", 40);
if (opts && opts.context) {
            _yuitest_coverline("build/yql/yql.js", 41);
this._context = opts.context;
            _yuitest_coverline("build/yql/yql.js", 42);
delete opts.context;
        }
        
        _yuitest_coverline("build/yql/yql.js", 45);
if (params && params.context) {
            _yuitest_coverline("build/yql/yql.js", 46);
this._context = params.context;
            _yuitest_coverline("build/yql/yql.js", 47);
delete params.context;
        }
        
        _yuitest_coverline("build/yql/yql.js", 50);
this._params = params;
        _yuitest_coverline("build/yql/yql.js", 51);
this._opts = opts;
        _yuitest_coverline("build/yql/yql.js", 52);
this._callback = callback;

    };
    
    _yuitest_coverline("build/yql/yql.js", 56);
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
            _yuitest_coverfunc("build/yql/yql.js", "_internal", 92);
_yuitest_coverline("build/yql/yql.js", 93);
this._callback.apply(this._context, arguments);
        },
        /**
        * @method send
        * @description The method that executes the YQL Request.
        * @chainable
        * @return {YQLRequest}
        */
        send: function() {
            _yuitest_coverfunc("build/yql/yql.js", "send", 101);
_yuitest_coverline("build/yql/yql.js", 102);
var qs = [], url = ((this._opts && this._opts.proto) ? this._opts.proto : Y.YQLRequest.PROTO);

            _yuitest_coverline("build/yql/yql.js", 104);
Y.each(this._params, function(v, k) {
                _yuitest_coverfunc("build/yql/yql.js", "(anonymous 2)", 104);
_yuitest_coverline("build/yql/yql.js", 105);
qs.push(k + '=' + encodeURIComponent(v));
            });

            _yuitest_coverline("build/yql/yql.js", 108);
qs = qs.join('&');
            
            _yuitest_coverline("build/yql/yql.js", 110);
url += ((this._opts && this._opts.base) ? this._opts.base : Y.YQLRequest.BASE_URL) + qs;
            
            _yuitest_coverline("build/yql/yql.js", 112);
var o = (!Y.Lang.isFunction(this._callback)) ? this._callback : { on: { success: this._callback } };

            _yuitest_coverline("build/yql/yql.js", 114);
o.on = o.on || {};
            _yuitest_coverline("build/yql/yql.js", 115);
this._callback = o.on.success;

            _yuitest_coverline("build/yql/yql.js", 117);
o.on.success = Y.bind(this._internal, this);

            _yuitest_coverline("build/yql/yql.js", 119);
if (o.allowCache !== false) {
                _yuitest_coverline("build/yql/yql.js", 120);
o.allowCache = true;
            }
            
            _yuitest_coverline("build/yql/yql.js", 123);
if (!this._jsonp) {
                _yuitest_coverline("build/yql/yql.js", 124);
this._jsonp = Y.jsonp(url, o);
            } else {
                _yuitest_coverline("build/yql/yql.js", 126);
this._jsonp.url = url;
                _yuitest_coverline("build/yql/yql.js", 127);
if (o.on && o.on.success) {
                    _yuitest_coverline("build/yql/yql.js", 128);
this._jsonp._config.on.success = o.on.success;
                }
                _yuitest_coverline("build/yql/yql.js", 130);
this._jsonp.send();
            }
            _yuitest_coverline("build/yql/yql.js", 132);
return this;
        }
    };

    /**
    * @static
    * @property FORMAT
    * @description Default format to use: json
    */
    _yuitest_coverline("build/yql/yql.js", 141);
YQLRequest.FORMAT = 'json';
    /**
    * @static
    * @property PROTO
    * @description Default protocol to use: http
    */
    _yuitest_coverline("build/yql/yql.js", 147);
YQLRequest.PROTO = 'http';
    /**
    * @static
    * @property BASE_URL
    * @description The base URL to query: query.yahooapis.com/v1/public/yql?
    */
    _yuitest_coverline("build/yql/yql.js", 153);
YQLRequest.BASE_URL = ':/'+'/query.yahooapis.com/v1/public/yql?';
    /**
    * @static
    * @property ENV
    * @description The environment file to load: http://datatables.org/alltables.env
    */
    _yuitest_coverline("build/yql/yql.js", 159);
YQLRequest.ENV = 'http:/'+'/datatables.org/alltables.env';
    
    _yuitest_coverline("build/yql/yql.js", 161);
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
	_yuitest_coverline("build/yql/yql.js", 172);
Y.YQL = function(sql, callback, params, opts) {
        _yuitest_coverfunc("build/yql/yql.js", "YQL", 172);
_yuitest_coverline("build/yql/yql.js", 173);
return new Y.YQLRequest(sql, callback, params, opts).send();
    };



}, '@VERSION@', {"requires": ["jsonp", "jsonp-url"]});
