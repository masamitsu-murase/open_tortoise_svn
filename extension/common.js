
var gCommon = (function(){
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
            return { url: url, params: {} };
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
            url: url,
            params: params
        };
    };

    return {
        parseUrl: parseUrl
    };
})();
