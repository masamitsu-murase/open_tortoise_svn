
(function(){
    var INFO_ATTRIBUTE1 = "data-tsvn-info";  // for HTML5
    var INFO_ATTRIBUTE2 = "rel";             // for HTML4.01

    var target_url_list = [];

    var load = function(){
        var bodies = document.getElementsByTagName("body");
        if (!bodies || bodies.length != 1){
            return;
        }
        var body = bodies[0];
        body.addEventListener("click", handleClickEvent, false);

        gChromeDeferred.sendRequest({ action: "targetUrlList" })
        .next(function(response){
            if (response.result == gCommon.RESULT_SUCCESS && (response.target_url_list instanceof Array)){
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

        var url_data = gCommon.parseUrl(anchor.href);
        if (!url_data ||
            !target_url_list.some(function(u){ return url_data.url.substr(0, u.length) == u; })){
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
        }else{
            // If tsvn attribute does not exist, URL parameter "p" or "r" is used as a revision.
            if (url_data.params.r){
                callback_args = [ url_data.params.r ];
            }else if (url_data.params.p){
                callback_args = [ url_data.params.p ];
            }
        }
        if (!callback_type){
            callback_type = gCommon.DEFAULT_ACTION;
        }

        gChromeDeferred.sendRequest({
          action: callback_type,
          raw_url: url_data.raw_url,
          url: url_data.url,
          args: callback_args
        }).next(function(response){
            if (response.result == gCommon.RESULT_SUCCESS){
                //
            }else if (response.result == gCommon.RESULT_FAILURE){
                alert(chrome.i18n.getMessage("cannot_open_tortoisesvn"));
            }else{
                alert(chrome.i18n.getMessage("cannot_open_tortoisesvn_host"));
            }
        });

        event.preventDefault();
    };

    window.addEventListener("load", load);
})();

