
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
            Deferred.next(function(){
                var ret = {};
                if (response){
                    if (response.result){
                        ret.result = gCommon.RESULT_SUCCESS;
                        ret.data = result.data;
                    }else{
                        ret.result = gCommon.RESULT_FAILURE;
                        ret.error = result.error;
                    }
                }else{
                    ret.result = gCommon.RESULT_INVALID_NATIVE_MESSAGING;
                    ret.error = error;
                }
                d.call(ret);
            });
        });

        return d;
    };

    return {
        tsvn: tsvn
    };
})();

