
(function(){
    var ACTION_NAME_LIST = {
        browser: chrome.i18n.getMessage("open_reposbrowser"),
        log: chrome.i18n.getMessage("open_log"),
        blame: chrome.i18n.getMessage("open_blame"),
        open_in_chrome: chrome.i18n.getMessage("open_in_chrome")
    };

    var gValue = {};

    var load = function(){
        loadValue();
        setEventHandler();

        setPageSelectEventHandler();
    };

    var loadValue = function(){
        gValue = gOptionValue.loadValue();
        initializeView(gValue);
    };

    var saveValue = function(){
        gOptionValue.saveValue(gValue);
    };

    var initializeView = function(value){
        document.getElementById("tortoise_proc_path").value = value.tortoise_proc_path;
        document.getElementById("tortoise_svn_action").value = value.tortoise_svn_action;
        value.added_url_list.forEach(addRepositoryUrl);
        value.extension_actions.forEach(addExtensionAction);
    };

    var addRepositoryUrl = function(url){
        var ul = document.getElementById("added_url_list");

        var li = document.createElement("li");
        ul.appendChild(li);

        var span = document.createElement("span");
        li.appendChild(span);
        span.appendChild(document.createTextNode(url));

        var input = document.createElement("input");
        li.appendChild(input);
        input.setAttribute("type", "button");
        input.setAttribute("value", chrome.i18n.getMessage("Remove"));
        input.addEventListener("click", function(e){
            var li = e.target.parentNode;
            var index = Array.prototype.indexOf.call(li.parentNode.childNodes, li);
            if (index < 0){
                return;
            }

            li.parentNode.removeChild(li);
            gValue.added_url_list.splice(index, 1);
            setSaveButtonAlert();
        });
    };

    var addExtensionAction = function(extension_action){
        var extension = extension_action.extension;
        var action = extension_action.action;

        var tbody = document.getElementById("extension_action_list").getElementsByTagName("tbody")[0];
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(extension));
        tr.appendChild(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode(ACTION_NAME_LIST[action]));
        tr.appendChild(td);
        
        td = document.createElement("td");
        var input = document.createElement("input");
        input.setAttribute("type", "button");
        input.setAttribute("value", chrome.i18n.getMessage("Remove"));
        input.addEventListener("click", function(event){
            var parent_td = event.target.parentNode.parentNode;
            var index = Array.prototype.indexOf.call(parent_td.parentNode.childNodes, 
                                                     parent_td);
            if (index < 0){
                return;
            }

            parent_td.parentNode.removeChild(parent_td);
            gValue.extension_actions.splice(index, 1);
            setSaveButtonAlert();
        });
        td.appendChild(input);
        tr.appendChild(td);

        tbody.appendChild(tr);
    };

    var setSaveButtonAlert = function(){
        var save_buttons = document.getElementsByClassName("save_button");
        Array.prototype.forEach.call(save_buttons, function(save_button){
            var names = save_button.className.split(" ").filter(function(item){ return !!item; });
            if (names.indexOf("alert") >= 0){
                return;
            }
            names.push("alert");
            save_button.className = names.join(" ");
        });
    };

    var clearSaveButtonAlert = function(){
        var save_buttons = document.getElementsByClassName("save_button");
        Array.prototype.forEach.call(save_buttons, function(save_button){
            var names = save_button.className.split(" ").filter(function(item){ return !!item; });
            if (names.indexOf("alert") < 0){
                return;
            }
            names = names.filter(function(item){ return item != "alert"; });
            save_button.className = names.join(" ");
        });
    };

    var setEventHandler = function(){
        document.getElementById("tortoise_proc_path").addEventListener("change", function(e){
            gValue.tortoise_proc_path = document.getElementById("tortoise_proc_path").value;
            setSaveButtonAlert();
        });

        document.getElementById("tortoise_svn_action").addEventListener("change", function(e){
            gValue.tortoise_svn_action = document.getElementById("tortoise_svn_action").value;
            setSaveButtonAlert();
        });

        document.getElementById("add_button").addEventListener("click", function(e){
            var elem = document.getElementById("added_url");
            var url = elem.value.trim();
            if (url != ""){
                gValue.added_url_list.push(url);
                addRepositoryUrl(url);
                elem.value = "";
                setSaveButtonAlert();
            }
        });

        document.getElementById("extension_action_add_button").addEventListener("click", function(e){
            var extension_text = document.getElementById("extension_text").value.trim();
            var extension_action = document.getElementById("extension_action").value;
            if (extension_text != ""){
                var value = { extension: extension_text, action: extension_action };
                gValue.extension_actions.push(value);
                addExtensionAction(value);
                document.getElementById("extension_text").value = "";
                setSaveButtonAlert();
            }
        });

        var save_buttons = document.getElementsByClassName("save_button");
        Array.prototype.forEach.call(save_buttons, function(save_button){
            save_button.addEventListener("click", function(e){
                saveValue();
                clearSaveButtonAlert();
            });
        });
    };

    var setPageSelectEventHandler = function(){
        // Both "getElementsByTagName" and "getElementsByClassName" do not return Array instance,
        // but they return NodeList.
        var to_array = function(obj){
            var ary = [];
            for (var i=0; i<obj.length; i++){
                ary.push(obj[i]);
            }
            return ary;
        };
        var list_items = to_array(document.getElementById("option_index").getElementsByTagName("li"));
        var pages = to_array(document.getElementById("option_pages").getElementsByClassName("option_page"));
        if (list_items.length != pages.length){
            return;
        }

        list_items.forEach(function(li, index){
            li.addEventListener("click", function(event){
                if (li.className.split(/\s+/).indexOf("selected") >= 0){
                    return;
                }

                var set_selected = function(target, target_index){
                    if (target_index != index){
                        target.className = target.className.split(/\s+/).filter(function(cl){
                            return cl!="selected";
                        }).join(" ");
                    }else{
                        target.className = target.className.split(/\s+/).filter(function(cl){
                            return cl!="selected";
                        }).concat("selected").join(" ");
                    }
                };
                list_items.forEach(set_selected);
                pages.forEach(set_selected);
            });
        });
    };

    window.addEventListener("load", load);
})();

