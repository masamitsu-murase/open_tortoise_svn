
(function(){
    var target_url_list = [];

    var load = function(){
        var bodies = document.getElementsByTagName("body");
        if (!bodies){
            return;
        }
        var body = bodies[0];
        body.addEventListener("click", handleClickEvent, false);

        chrome.extension.sendRequest({ action: "targetUrlList" }, function(response){
            if (response.ret && (response.target_url_list instanceof Array)){
                target_url_list = response.target_url_list;
            }
        });
    };

    var handleClickEvent = function(event){
        var target = event.target;
        if (target.tagName.toLowerCase() != "a"){
            return;
        }

        var url = target.href;
        if (!target_url_list.some(function(u){ return url.substr(0, u.length) == u; })){
            return;
        }

        chrome.extension.sendRequest({ action: "openUrl", url: url }, function(response){
            if (!response.ret){
                alert(chrome.i18n.getMessage("cannot_open_tortoisesvn"));
            }
        });
        event.preventDefault();
    };

    window.addEventListener("load", load);
})();

