
(function(){
    var INFO_ATTRIBUTE1 = "data-tsvn-info";  // for HTML5
    var INFO_ATTRIBUTE2 = "rel";             // for HTML4.01
    var DEFAULT_ACTION = "not_specified";

    var target_url_list = [];

    var load = function(){
        var bodies = document.getElementsByTagName("body");
        if (!bodies || bodies.length != 1){
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

    var findAnchorInAncestors = function(elem){
        try{
            var fail_safe = 0;
            while(elem && fail_safe++ < 100){
                if (elem.tagName.toLowerCase() == "a"){
                    return elem;
                }
                elem = elem.parentNode;
            }
        }catch(e){
        }
        return null;
    };

    var handleClickEvent = function(event){
        var anchor = findAnchorInAncestors(event.target);
        if (!anchor){
            return;
        }

        var url = anchor.href;
        if (!url || !target_url_list.some(function(u){ return url.substr(0, u.length) == u; })){
            return;
        }

        var callback_type = null;
        var callback_args = [];

        // Action:
        //  priority 1
        //  "action" is defined by HTML attribute.
        var info = null;
        if (anchor.hasAttribute(INFO_ATTRIBUTE1)){
            info = anchor.getAttribute(INFO_ATTRIBUTE1);
        }else if (anchor.hasAttribute(INFO_ATTRIBUTE2)){
            info = anchor.getAttribute(INFO_ATTRIBUTE2);
        }
        if (info){
            var reg = /\btsvn\[(.*?)\](?:\[(.*?)\])?/;
            var match_data = info.match(reg);
            if (match_data){
                callback_type = match_data[1];
                if (match_data[2]){
                    callback_args = match_data[2].split(",");
                }
            }
        }
        if (!callback_type){
            callback_type = DEFAULT_ACTION;
        }

        chrome.extension.sendRequest({ action: callback_type, url: url, args: callback_args }, function(response){
            if (!response.ret){
                alert(chrome.i18n.getMessage("cannot_open_tortoisesvn"));
            }
        });
        event.preventDefault();
    };

    window.addEventListener("load", load);
})();

