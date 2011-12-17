
(function(){
    var tsvn = document.getElementById("tsvn");
    if (!tsvn){
        return;
    }

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
        var ret = { ret: false };

        try{
            var action = request.action;
            if (action == gCommon.DEFAULT_ACTION){
                // priority 2
                action = extensionAction(request.url);
                // priority 3
                if (!action){
                    action = gOptionValue.loadValue().tortoise_svn_action;
                }
            }

            switch(action){
              case "targetUrlList":
                ret.target_url_list = gOptionValue.loadValue().added_url_list;
                ret.ret = true;
                break;
              case "browser":
                var args = (request.args || []);
                ret.ret = openRepobrowser(request.url, args[0]);
                break;
              case "log":
                var args = (request.args || []);
                ret.ret = openLog(request.url, args[0], args[1]);
                break;
              case "blame":
                ret.ret = openBlame(request.url);
                break;
            }
        }catch(e){
            ret.ret = false;
        }

        sendResponse(ret);
    });

    var extensionAction = function(url){
        if (!url){
            return false;
        }

        var value = gOptionValue.loadValue().extension_actions;
        var action = null;
        for (var i=0; i<value.length; i++){
            var extensions = value[i].extension.split(",").map(function(item){ return item.trim(); });
            if (extensions.some(function(ext){
                // "*.ext" is expected.
                if (ext[0] == "*"){
                    ext = ext.substr(1);
                }
                if (ext == ""){
                    return false;
                }
                return (url.substr(url.length - ext.length).toLowerCase() == ext.toLowerCase());
            })){
                action = value[i].action;
                break;
            }
        }
        return action;
    };

    var runTortoiseSvn = function(args){
        var value = gOptionValue.loadValue();
        var path = value.tortoise_proc_path;
        if (!path){
            return false;
        }

        switch(args.length){
          case 1:
            return tsvn.tsvn(path, args[0]);
          case 2:
            return tsvn.tsvn(path, args[0], args[1]);
          case 3:
            return tsvn.tsvn(path, args[0], args[1], args[2]);
          case 4:
            return tsvn.tsvn(path, args[0], args[1], args[2], args[3]);
          case 5:
            return tsvn.tsvn(path, args[0], args[1], args[2], args[3], args[4]);
          default:
            return false;
        }
    };

    var openRepobrowser = function(url, rev){
        if (!url){
            return false;
        }

        var args = [ "/command:repobrowser", "/path:" + url ];
        if (rev===0 || rev){
            args.push("/rev:" + rev);
        }

        return runTortoiseSvn(args);
    };

    var openLog = function(url, startrev, endrev){
        if (!url){
            return false;
        }

        var args = [ "/command:log", "/path:" + url ];
        if (startrev===0 || startrev){
            args.push("/startrev:" + startrev);
        }
        if (endrev===0 || endrev){
            args.push("/endrev:" + endrev);
        }

        return runTortoiseSvn(args);
    };

    var openBlame = function(url){
        if (!url){
            return false;
        }

        var args = [ "/command:blame", "/path:" + url ];
        return runTortoiseSvn(args);
    };

    // event handler of icon clicking
    chrome.browserAction.onClicked.addListener(function(tab){
        chrome.tabs.create({ url: "options.html" });
    });

    // context menu
    var parent = chrome.contextMenus.create({
        title: "Open TortoiseSVN",
        contexts: [ "page", "link" ]
    });
    var menu_callback_gen = function(func){
        return function(info, tab){
            var ret = false;
            if (info.linkUrl){
                ret = func(info.linkUrl);
            }else{
                ret = func(info.pageUrl);
            }
            if (!ret){
                alert(chrome.i18n.getMessage("cannot_open_tortoisesvn"));
            }
        };
    };
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("open_reposbrowser"),
        parentId: parent,
        contexts: [ "page", "link" ],
        onclick: menu_callback_gen(openRepobrowser)
    });
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("open_log"),
        parentId: parent,
        contexts: [ "page", "link" ],
        onclick: menu_callback_gen(openLog)
    });
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("open_blame"),
        parentId: parent,
        contexts: [ "page", "link" ],
        onclick: menu_callback_gen(openBlame)
    });
})();

