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
_yuitest_coverage["yql"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "yql",
    code: []
};
_yuitest_coverage["yql"].code=["YUI.add('yql', function (Y, NAME) {","","YUI.add('yql', function (Y, NAME) {","","    /**","     * This class adds a sugar class to allow access to YQL (http://developer.yahoo.com/yql/).","     * @module yql","     */     ","    /**","     * Utility Class used under the hood my the YQL class","     * @class YQLRequest","     * @constructor","     * @param {String} sql The SQL statement to execute","     * @param {Function/Object} callback The callback to execute after the query (Falls through to JSONP).","     * @param {Object} params An object literal of extra parameters to pass along (optional).","     * @param {Object} opts An object literal of configuration options (optional): proto (http|https), base (url)","     */","    var YQLRequest = function (sql, callback, params, opts) {","        ","        if (!params) {","            params = {};","        }","        params.q = sql;","        //Allow format override.. JSON-P-X","        if (!params.format) {","            params.format = Y.YQLRequest.FORMAT;","        }","        if (!params.env) {","            params.env = Y.YQLRequest.ENV;","        }","","        this._context = this;","","        if (opts && opts.context) {","            this._context = opts.context;","            delete opts.context;","        }","        ","        if (params && params.context) {","            this._context = params.context;","            delete params.context;","        }","        ","        this._params = params;","        this._opts = opts;","        this._callback = callback;","","    };","    ","    YQLRequest.prototype = {","        /**","        * @private","        * @property _jsonp","        * @description Reference to the JSONP instance used to make the queries","        */","        _jsonp: null,","        /**","        * @private","        * @property _opts","        * @description Holder for the opts argument","        */","        _opts: null,","        /**","        * @private","        * @property _callback","        * @description Holder for the callback argument","        */","        _callback: null,","        /**","        * @private","        * @property _params","        * @description Holder for the params argument","        */","        _params: null,","        /**","        * @private","        * @property _context","        * @description The context to execute the callback in","        */","        _context: null,","        /**","        * @private","        * @method _internal","        * @description Internal Callback Handler","        */","        _internal: function() {","            this._callback.apply(this._context, arguments);","        },","        /**","        * @method send","        * @description The method that executes the YQL Request.","        * @chainable","        * @return {YQLRequest}","        */","        send: function() {","            var qs = [], url = ((this._opts && this._opts.proto) ? this._opts.proto : Y.YQLRequest.PROTO);","","            Y.each(this._params, function(v, k) {","                qs.push(k + '=' + encodeURIComponent(v));","            });","","            qs = qs.join('&');","            ","            url += ((this._opts && this._opts.base) ? this._opts.base : Y.YQLRequest.BASE_URL) + qs;","            ","            var o = (!Y.Lang.isFunction(this._callback)) ? this._callback : { on: { success: this._callback } };","","            o.on = o.on || {};","            this._callback = o.on.success;","","            o.on.success = Y.bind(this._internal, this);","","            if (o.allowCache !== false) {","                o.allowCache = true;","            }","            ","            if (!this._jsonp) {","                this._jsonp = Y.jsonp(url, o);","            } else {","                this._jsonp.url = url;","                if (o.on && o.on.success) {","                    this._jsonp._config.on.success = o.on.success;","                }","                this._jsonp.send();","            }","            return this;","        }","    };","","    /**","    * @static","    * @property FORMAT","    * @description Default format to use: json","    */","    YQLRequest.FORMAT = 'json';","    /**","    * @static","    * @property PROTO","    * @description Default protocol to use: http","    */","    YQLRequest.PROTO = 'http';","    /**","    * @static","    * @property BASE_URL","    * @description The base URL to query: query.yahooapis.com/v1/public/yql?","    */","    YQLRequest.BASE_URL = ':/'+'/query.yahooapis.com/v1/public/yql?';","    /**","    * @static","    * @property ENV","    * @description The environment file to load: http://datatables.org/alltables.env","    */","    YQLRequest.ENV = 'http:/'+'/datatables.org/alltables.env';","    ","    Y.YQLRequest = YQLRequest;","	","    /**","     * This class adds a sugar class to allow access to YQL (http://developer.yahoo.com/yql/).","     * @class YQL","     * @constructor","     * @param {String} sql The SQL statement to execute","     * @param {Function} callback The callback to execute after the query (optional).","     * @param {Object} params An object literal of extra parameters to pass along (optional).","     * @param {Object} opts An object literal of configuration options (optional): proto (http|https), base (url)","     */","	Y.YQL = function(sql, callback, params, opts) {","        return new Y.YQLRequest(sql, callback, params, opts).send();","    };","","","","}, '@VERSION@', {\"requires\": [\"jsonp\", \"jsonp-url\"]});","","","}, '@VERSION@', {\"requires\": [\"jsonp\", \"jsonp-url\"]});"];
_yuitest_coverage["yql"].lines = {"1":0,"3":0,"18":0,"20":0,"21":0,"23":0,"25":0,"26":0,"28":0,"29":0,"32":0,"34":0,"35":0,"36":0,"39":0,"40":0,"41":0,"44":0,"45":0,"46":0,"50":0,"87":0,"96":0,"98":0,"99":0,"102":0,"104":0,"106":0,"108":0,"109":0,"111":0,"113":0,"114":0,"117":0,"118":0,"120":0,"121":0,"122":0,"124":0,"126":0,"135":0,"141":0,"147":0,"153":0,"155":0,"166":0,"167":0};
_yuitest_coverage["yql"].functions = {"YQLRequest:18":0,"_internal:86":0,"(anonymous 3):98":0,"send:95":0,"YQL:166":0,"(anonymous 2):3":0,"(anonymous 1):1":0};
_yuitest_coverage["yql"].coveredLines = 47;
_yuitest_coverage["yql"].coveredFunctions = 7;
_yuitest_coverline("yql", 1);
YUI.add('yql', function (Y, NAME) {

_yuitest_coverfunc("yql", "(anonymous 1)", 1);
_yuitest_coverline("yql", 3);
YUI.add('yql', function (Y, NAME) {

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
    _yuitest_coverfunc("yql", "(anonymous 2)", 3);
_yuitest_coverline("yql", 18);
var YQLRequest = function (sql, callback, params, opts) {
        
        _yuitest_coverfunc("yql", "YQLRequest", 18);
_yuitest_coverline("yql", 20);
if (!params) {
            _yuitest_coverline("yql", 21);
params = {};
        }
        _yuitest_coverline("yql", 23);
params.q = sql;
        //Allow format override.. JSON-P-X
        _yuitest_coverline("yql", 25);
if (!params.format) {
            _yuitest_coverline("yql", 26);
params.format = Y.YQLRequest.FORMAT;
        }
        _yuitest_coverline("yql", 28);
if (!params.env) {
            _yuitest_coverline("yql", 29);
params.env = Y.YQLRequest.ENV;
        }

        _yuitest_coverline("yql", 32);
this._context = this;

        _yuitest_coverline("yql", 34);
if (opts && opts.context) {
            _yuitest_coverline("yql", 35);
this._context = opts.context;
            _yuitest_coverline("yql", 36);
delete opts.context;
        }
        
        _yuitest_coverline("yql", 39);
if (params && params.context) {
            _yuitest_coverline("yql", 40);
this._context = params.context;
            _yuitest_coverline("yql", 41);
delete params.context;
        }
        
        _yuitest_coverline("yql", 44);
this._params = params;
        _yuitest_coverline("yql", 45);
this._opts = opts;
        _yuitest_coverline("yql", 46);
this._callback = callback;

    };
    
    _yuitest_coverline("yql", 50);
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
            _yuitest_coverfunc("yql", "_internal", 86);
_yuitest_coverline("yql", 87);
this._callback.apply(this._context, arguments);
        },
        /**
        * @method send
        * @description The method that executes the YQL Request.
        * @chainable
        * @return {YQLRequest}
        */
        send: function() {
            _yuitest_coverfunc("yql", "send", 95);
_yuitest_coverline("yql", 96);
var qs = [], url = ((this._opts && this._opts.proto) ? this._opts.proto : Y.YQLRequest.PROTO);

            _yuitest_coverline("yql", 98);
Y.each(this._params, function(v, k) {
                _yuitest_coverfunc("yql", "(anonymous 3)", 98);
_yuitest_coverline("yql", 99);
qs.push(k + '=' + encodeURIComponent(v));
            });

            _yuitest_coverline("yql", 102);
qs = qs.join('&');
            
            _yuitest_coverline("yql", 104);
url += ((this._opts && this._opts.base) ? this._opts.base : Y.YQLRequest.BASE_URL) + qs;
            
            _yuitest_coverline("yql", 106);
var o = (!Y.Lang.isFunction(this._callback)) ? this._callback : { on: { success: this._callback } };

            _yuitest_coverline("yql", 108);
o.on = o.on || {};
            _yuitest_coverline("yql", 109);
this._callback = o.on.success;

            _yuitest_coverline("yql", 111);
o.on.success = Y.bind(this._internal, this);

            _yuitest_coverline("yql", 113);
if (o.allowCache !== false) {
                _yuitest_coverline("yql", 114);
o.allowCache = true;
            }
            
            _yuitest_coverline("yql", 117);
if (!this._jsonp) {
                _yuitest_coverline("yql", 118);
this._jsonp = Y.jsonp(url, o);
            } else {
                _yuitest_coverline("yql", 120);
this._jsonp.url = url;
                _yuitest_coverline("yql", 121);
if (o.on && o.on.success) {
                    _yuitest_coverline("yql", 122);
this._jsonp._config.on.success = o.on.success;
                }
                _yuitest_coverline("yql", 124);
this._jsonp.send();
            }
            _yuitest_coverline("yql", 126);
return this;
        }
    };

    /**
    * @static
    * @property FORMAT
    * @description Default format to use: json
    */
    _yuitest_coverline("yql", 135);
YQLRequest.FORMAT = 'json';
    /**
    * @static
    * @property PROTO
    * @description Default protocol to use: http
    */
    _yuitest_coverline("yql", 141);
YQLRequest.PROTO = 'http';
    /**
    * @static
    * @property BASE_URL
    * @description The base URL to query: query.yahooapis.com/v1/public/yql?
    */
    _yuitest_coverline("yql", 147);
YQLRequest.BASE_URL = ':/'+'/query.yahooapis.com/v1/public/yql?';
    /**
    * @static
    * @property ENV
    * @description The environment file to load: http://datatables.org/alltables.env
    */
    _yuitest_coverline("yql", 153);
YQLRequest.ENV = 'http:/'+'/datatables.org/alltables.env';
    
    _yuitest_coverline("yql", 155);
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
	_yuitest_coverline("yql", 166);
Y.YQL = function(sql, callback, params, opts) {
        _yuitest_coverfunc("yql", "YQL", 166);
_yuitest_coverline("yql", 167);
return new Y.YQLRequest(sql, callback, params, opts).send();
    };



}, '@VERSION@', {"requires": ["jsonp", "jsonp-url"]});


}, '@VERSION@', {"requires": ["jsonp", "jsonp-url"]});
