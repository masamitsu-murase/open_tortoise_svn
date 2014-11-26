
var gChromeDeferred = (function(){
    var sendRequest = function(obj){
        var d = new Deferred();
        chrome.extension.sendRequest(obj, function(response){
            d.call(response);
        });
        return d;
    };

    return {
        sendRequest: sendRequest
    };
})();

