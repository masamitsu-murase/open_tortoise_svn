
(function(){
    var DEFAULT_ACTION = "not_specified";

    var tsvn = document.getElementById("tsvn");
    if (!tsvn){
        return;
    }

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
        var ret = { ret: false };

        try{
            var action = request.action;
            if (action == DEFAULT_ACTION){
                action = gOptionValue.loadValue().tortoise_svn_action;
            }

            switch(action){
              case "targetUrlList":
                ret.target_url_list = gOptionValue.loadValue().added_url_list;
                ret.ret = true;
                break;
              case "browser":
                ret.ret = openRepobrowser(request.url);
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

    var openRepobrowser = function(url){
        var value = gOptionValue.loadValue();
        return tsvn.tsvn(value.tortoise_proc_path, "/command:repobrowser", "/path:" + url);
    };

    var openLog = function(url, startrev, endrev){
        var value = gOptionValue.loadValue();
        var args = [ value.tortoise_proc_path, "/command:log", "/path:" + url ];
        if (startrev===0 || startrev){
            args.push("/startrev:" + startrev);
        }
        if (endrev===0 || endrev){
            args.push("/endrev:" + endrev);
        }

        switch(args.length){
          case 3:
            return tsvn.tsvn(args[0], args[1], args[2]);
          case 4:
            return tsvn.tsvn(args[0], args[1], args[2], args[3]);
          case 5:
            return tsvn.tsvn(args[0], args[1], args[2], args[3], args[4]);
          default:
            return false;
        }
    };

    var openBlame = function(url){
        var value = gOptionValue.loadValue();
        return tsvn.tsvn(value.tortoise_proc_path, "/command:blame", "/path:" + url);
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

