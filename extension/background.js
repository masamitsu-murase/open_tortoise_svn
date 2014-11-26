
(function(){
    var tsvn = gTortoiseSvn;

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
                openRepobrowser(request.url, args[0])
                .next(function(result){
                    ret.ret = result;
                    sendResponse(ret);
                }).error(function(){
                    ret.ret = false;
                    sendResponse(ret);
                });
                return;  // deferred
              case "log":
                var args = (request.args || []);
                openLog(request.url, args[0], args[1])
                .next(function(result){
                    ret.ret = result;
                    sendResponse(ret);
                }).error(function(){
                    ret.ret = false;
                    sendResponse(ret);
                });
                return;  // deferred
              case "blame":
                openBlame(request.url)
                .next(function(result){
                    ret.ret = result;
                    sendResponse(ret);
                }).error(function(){
                    ret.ret = false;
                    sendResponse(ret);
                });
                return;  // deferred
              case "open_in_chrome":
                chrome.tabs.update(sender.tab.id, { url: request.raw_url }, function(){});
                ret.ret = true;
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
            var d = Deferred();
            setTimeout(function(){ d.fail(false); }, 0);
            return d;
        }

        return tsvn.tsvn(path, args);
    };

    var openRepobrowser = function(url, rev){
        if (!url){
            var d = new Deferred();
            setTimeout(function(){ d.fail(false); }, 0);
            return d;
        }

        var args = [ "/command:repobrowser", "/path:" + url ];
        if (rev===0 || rev){
            args.push("/rev:" + rev);
        }

        return runTortoiseSvn(args);
    };

    var openLog = function(url, startrev, endrev){
        if (!url){
            var d = new Deferred();
            setTimeout(function(){ d.fail(false); }, 0);
            return d;
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
            var d = new Deferred();
            setTimeout(function(){ d.fail(false); }, 0);
            return d;
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
            var url_data = null;
            try{
                if (info.linkUrl){
                    url_data = gCommon.parseUrl(info.linkUrl);
                }else{
                    url_data = gCommon.parseUrl(info.pageUrl);
                }
                if (url_data){
                    func(url_data.url, (url_data.params.p || url_data.params.r))
                    .next(function(result){
                        if (!result){
                            alert(chrome.i18n.getMessage("cannot_open_tortoisesvn"));
                        }
                    }).error(function(){
                        alert(chrome.i18n.getMessage("cannot_open_tortoisesvn"));
                    });
                }
            }catch(e){
                ret = false;
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
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("open_in_chrome"),
        parentId: parent,
        contexts: [ "page", "link" ],
        onclick: function(info, tab){
            if (info.linkUrl){
                chrome.tabs.update(tab.id, { url: info.linkUrl }, function(){});
            }else{
                chrome.tabs.update(tab.id, { url: info.pageUrl }, function(){});
            }
        }
    });
})();

