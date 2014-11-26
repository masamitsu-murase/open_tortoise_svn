
var gTortoiseSvn = (function(){
    var NATIVE_MESSAGING_HOST = "masamitsu.murase.open_tortoise_svn";

    var tsvn = function(path, args){
        var obj = {
            action: "tsvn",
            path: path,
            args: args
        };

        var d = new Deferred();
        chrome.runtime.sendNativeMessage(NATIVE_MESSAGING_HOST, obj, function(response){
            var error = chrome.runtime.lastError;
            setTimeout(function(){ d.call({ response: response, error: error }); }, 0);
        });

        return d;
    };

    return {
        tsvn: tsvn
    };
})();

