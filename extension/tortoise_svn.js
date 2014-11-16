
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
                console.log("ERROR: " + chrome.runtime.lastError.message + ":" + response);
            } else {
                console.log("Messaging host: ", JSON.stringify(response));
            }
        });

        return true;
    };

    return {
        tsvn: tsvn
    };
})();

