
var gOptionValue = (function(){
    var VERSION = "0.0.1";

    var DEFAULT_VALUE = {
        tortoise_proc_path: "C:\\Program Files\\TortoiseSVN\\bin\\TortoiseProc.exe",
        added_url_list: [],

        version: VERSION
    };
    var SAVED_KEY = "saved_data";

    var loadValue = function(){
        var value = localStorage[SAVED_KEY];
        var saved_value;
        if (!value){
            saved_value = {};
            for (var k in DEFAULT_VALUE){
                saved_value[k] = DEFAULT_VALUE[k];
            }
        }else{
            saved_value = JSON.parse(value);
        }
        return saved_value;
    };

    var saveValue = function(value){
        value.version = VERSION;
        localStorage[SAVED_KEY] = JSON.stringify(value);
    };

    return {
        loadValue: loadValue,
        saveValue: saveValue
    };
})();

