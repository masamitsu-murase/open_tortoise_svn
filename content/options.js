/*
Copyright (C) 2011  Masamitsu MURASE

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>
*/

var gOpenTortoiseSvn = (function(){
    var initialize = function(){
        initializeTree();
        initializeFileField();
        updateButtons();
    };

    var saveOptions = function(){
        saveUrlTree();
        saveFileField();
    };

    var initializeTree = function(){
        var string = document.getElementById("url_list_pref");
        if (!string || !string.value){
            return;
        }

        var data = string.value.split("\n").forEach(function(v, i, ary){
            if (i % 2 == 0){
                addUrlTreeItem(v, ary[i+1]!="0");
            }
        });
    };

    var initializeFileField = function(){
        var file = document.getElementById("tortoise_svn_path_pref");
        if (!file || !file.value){
            return;
        }
        updateFileField(file.value);
    };

    var addUrl = function(){
        var url_textbox = document.getElementById("url_textbox");
        if (!url_textbox){
            return;
        }

        if (url_textbox.value.trim().length == 0){
            return;
        }

        addUrlTreeItem(url_textbox.value.trim(), true);
        url_textbox.value = "";

        updateAddButton();
    };

    var removeUrl = function(){
        var url_list_tree = document.getElementById("url_list_tree");
        var url_list_treechildren = document.getElementById("url_list_treechildren");
        if (!url_list_tree || !url_list_treechildren){
            return;
        }

        var removed = [];
        for (var i=0; i<url_list_treechildren.childNodes.length; i++){
            if (url_list_tree.view.selection.isSelected(i)){
                removed.push(url_list_treechildren.childNodes[i]);
            }
        }
        removed.forEach(function(elem){
            url_list_treechildren.removeChild(elem);
        });
    };

    var addUrlTreeItem = function(url, enabled){
        var url_list_treechildren = document.getElementById("url_list_treechildren");
        if (!url_list_treechildren){
            return;
        }

        var item = document.createElement("treeitem");
        var row = document.createElement("treerow");
        var cell_enabled = document.createElement("treecell");
        cell_enabled.setAttribute("value", enabled);
        var cell_url = document.createElement("treecell");
        cell_url.setAttribute("label", url);

        row.appendChild(cell_enabled);
        row.appendChild(cell_url);
        item.appendChild(row);
        url_list_treechildren.appendChild(item);
    };

    var saveUrlTree = function(){
        var url_list_treechildren = document.getElementById("url_list_treechildren");
        if (!url_list_treechildren){
            return;
        }

        var data = [];
        for (var i=0; i<url_list_treechildren.childNodes.length; i++){
            var treeitem = url_list_treechildren.childNodes[i];
            var treerow = treeitem.firstChild;
            var cell_enabled = treerow.firstChild;
            var cell_url = cell_enabled.nextSibling;

            var label = cell_url.getAttribute("label").trim();
            if (label.length > 0){
                data.push(label);
                data.push(cell_enabled.getAttribute("value") == "true" ? "1" : "0");
            }
        }
        document.getElementById("url_list_pref").value = data.join("\n");
    };

    var setPath = function(){
        var file_picker = Components.classes["@mozilla.org/filepicker;1"]
          .createInstance(Components.interfaces.nsIFilePicker);
        var strings = document.getElementById("open_tortoise_svn_strings");
        file_picker.init(window, strings.getString("select_tortoise_proc"), file_picker.modeOpen);
        file_picker.appendFilter(strings.getString("exe_files_filter_name"), "*.exe");
        file_picker.appendFilter(strings.getString("all_files_filter_name"), "*.*");
        if (file_picker.show() == file_picker.returnOK){
            updateFileField(file_picker.file);
        }
    };

    var updateFileField = function(file){
        var file_field = document.getElementById("tortoise_svn_filefield");
        if (file_field){
            file_field.file = file;
            file_field.label = file.path;
        }
    };

    var saveFileField = function(){
        var file_field = document.getElementById("tortoise_svn_filefield");
        if (!file_field || !file_field.file){
            return;
        }

        var file = document.getElementById("tortoise_svn_path_pref");
        if (!file || !file.value){
            return;
        }

        file.value = file_field.file;
    };

    var updateButtons = function(){
        updateAddButton();
        updateRemoveButton();
    };

    var updateAddButton = function(){
        var url_textbox = document.getElementById("url_textbox");
        var add_url_button = document.getElementById("add_url_button");
        if (url_textbox && add_url_button){
            add_url_button.disabled = (url_textbox.value.trim().length == 0);
        }
    };

    var updateRemoveButton = function(){
        var url_list_tree = document.getElementById("url_list_tree");
        var remove_url_button = document.getElementById("remove_url_button");
        if (url_list_tree && remove_url_button){
            remove_url_button.disabled = (url_list_tree.view.selection.count == 0);
        }
    };

    // publish functions
    return {
        initialize: initialize,
        saveOptions: saveOptions,
        setPath: setPath,
        addUrl: addUrl,
        removeUrl: removeUrl,
        updateAddButton: updateAddButton,
        updateRemoveButton: updateRemoveButton
    };
})();

