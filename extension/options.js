
(function(){
    var load = function(){
        var value = loadValue();
        initializeView(value);
        setEventHandler();
    };

    var loadValue = function(){
        return gOptionValue.loadValue();
    };

    var saveValue = function(){
        var value = {};
        value.tortoise_proc_path = document.getElementById("tortoise_proc_path").value;
        value.added_url_list = [];
        var lis = document.getElementById("added_url_list").childNodes;
        for (var i=0; i<lis.length; i++){
            value.added_url_list.push(lis[i].firstChild.firstChild.nodeValue);
        }

        gOptionValue.saveValue(value);
    };

    var initializeView = function(value){
        document.getElementById("tortoise_proc_path").value = value.tortoise_proc_path;
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

    window.addEventListener("load", load);
})();

