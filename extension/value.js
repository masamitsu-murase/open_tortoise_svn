
var gOptionValue = (function(){
    var VERSION = "0.0.2";

    var DEFAULT_VALUE = {
        tortoise_proc_path: "C:\\Program Files\\TortoiseSVN\\bin\\TortoiseProc.exe",
        tortoise_svn_action: "browser",
        added_url_list: [],
        extension_actions: [],

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
            if (saved_value.version != VERSION){
                updateVersion(saved_value);
            }
        }
        return saved_value;
    };

    var saveValue = function(value){
        value.version = VERSION;
        localStorage[SAVED_KEY] = JSON.stringify(value);
    };

    var updateVersion = function(value){
        switch(value.version){
          case "0.0.1":
            value.tortoise_svn_action = DEFAULT_VALUE.tortoise_svn_action;
        }
        value.version = VERSION;
    };

    return {
        loadValue: loadValue,
        saveValue: saveValue
    };
})();

