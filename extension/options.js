
(function(){
    var load = function(){
        var value = loadValue();
        initializeView(value);
        setEventHandler();

        setPageSelectEventHandler();
    };

    var loadValue = function(){
        return gOptionValue.loadValue();
    };

    var saveValue = function(){
        var value = {};
        value.tortoise_proc_path = document.getElementById("tortoise_proc_path").value;
        value.tortoise_svn_action = document.getElementById("tortoise_svn_action").value;
        value.added_url_list = [];
        var lis = document.getElementById("added_url_list").childNodes;
        for (var i=0; i<lis.length; i++){
            value.added_url_list.push(lis[i].firstChild.firstChild.nodeValue);
        }

        gOptionValue.saveValue(value);
    };

    var initializeView = function(value){
        document.getElementById("tortoise_proc_path").value = value.tortoise_proc_path;
        document.getElementById("tortoise_svn_action").value = value.tortoise_svn_action;
        value.added_url_list.forEach(addRepositoryUrl);
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
        input.setAttribute("value", "Remove");
        input.addEventListener("click", function(e){
            ul.removeChild(li);
            setSaveButtonAlert();
        });
    };

    var setSaveButtonAlert = function(){
        var save_button = document.getElementById("save_button");
        var names = save_button.className.split(" ").filter(function(item){ return !!item; });
        if (names.indexOf("alert") >= 0){
            return;
        }

        names.push("alert");
        save_button.className = names.join(" ");
    };

    var clearSaveButtonAlert = function(){
        var save_button = document.getElementById("save_button");
        var names = save_button.className.split(" ").filter(function(item){ return !!item; });
        if (names.indexOf("alert") < 0){
            return;
        }

        names = names.filter(function(item){ return item != "alert"; });
        save_button.className = names.join(" ");
    };

    var setEventHandler = function(){
        document.getElementById("tortoise_proc_path").addEventListener("change", function(e){
            setSaveButtonAlert();
        });

        document.getElementById("tortoise_svn_action").addEventListener("change", function(e){
            setSaveButtonAlert();
        });

        document.getElementById("add_button").addEventListener("click", function(e){
            var elem = document.getElementById("added_url");
            var url = elem.value.trim();
            if (url != ""){
                addRepositoryUrl(url);
                elem.value = "";
                setSaveButtonAlert();
            }
        });

        document.getElementById("save_button").addEventListener("click", function(e){
            saveValue();
            clearSaveButtonAlert();
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

