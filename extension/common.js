
var gCommon = (function(){
    var DEFAULT_ACTION = "not_specified";

    var RESULT_SUCCESS = 0;
    var RESULT_FAILURE = 1;
    var RESULT_INVALID_NATIVE_MESSAGING = 2;

    var parseUrl = function(raw_url){
        if (!raw_url){
            return null;
        }

        var match_data = raw_url.match(new RegExp("^[^?#]+"));
        if (!match_data){
            return null;
        }

        var url = match_data[0];
        match_data = raw_url.substr(url.length).match(new RegExp("([^?#]*)(#.*)?$"));
        if (!match_data){
            return { raw_url: raw_url, url: url, params: {} };
        }

        var params = {};
        match_data[1].split("&").forEach(function(key_value){
            var sep_index = key_value.indexOf("=");
            if (sep_index < 0){
                return;
            }

            var key = decodeURIComponent(key_value.substr(0, sep_index));
            var value = decodeURIComponent(key_value.substr(sep_index + 1));
            if (key in params){
                if (params[key] instanceof Array){
                    params[key].push(value);
                }else{
                    params[key] = [ params[key], value ];
                }
            }else{
                params[key] = value;
            }
        });

        return {
            raw_url: raw_url,
            url: url,
            params: params
        };
    };

    return {
        DEFAULT_ACTION: DEFAULT_ACTION,

        RESULT_SUCCESS: RESULT_SUCCESS,
        RESULT_FAILURE: RESULT_FAILURE,
        RESULT_INVALID_NATIVE_MESSAGING: RESULT_INVALID_NATIVE_MESSAGING,

        parseUrl: parseUrl
    };
})();
