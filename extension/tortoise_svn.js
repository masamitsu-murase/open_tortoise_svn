
var gTortoiseSvn = (function(){
    var NATIVE_MESSAGING_HOST = "masamitsu.murase.open_tortoise_svn";

    var tsvn = function(path, args){
        var obj = {
            action: "tsvn",
            path: path,
            args: args
        };

        chrome.runtime.sendNativeMessage(NATIVE_MESSAGING_HOST, obj, function(response){
            if (chrome.runtime.lastError){
                // console.log("ERROR: " + chrome.runtime.lastError.message + ":" + response);
                alert(chrome.i18n.getMessage("cannot_open_tortoisesvn_host"));
                return;
            }

            // console.log("Messaging host: ", JSON.stringify(response));
            if (response && response.result){
                return;
            }

            if (response){
                alert(chrome.i18n.getMessage("cannot_open_tortoisesvn") + "\n" + response.error);
            }
        });

        return true;
    };

    return {
        tsvn: tsvn
    };
})();

