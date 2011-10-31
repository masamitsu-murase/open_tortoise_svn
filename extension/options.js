
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
        });
    };

    var setEventHandler = function(){
        document.getElementById("add_button").addEventListener("click", function(e){
            var elem = document.getElementById("added_url");
            var url = elem.value.trim();
            if (url != ""){
                addRepositoryUrl(url);
                elem.value = "";
            }
        });

        document.getElementById("save_button").addEventListener("click", function(e){
            saveValue();
        });
    };

    window.addEventListener("load", load);
})();

