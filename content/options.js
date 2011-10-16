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
    var Cc = Components.classes;
    var Ci = Components.interfaces;
    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);

    var initialize = function(){
        // Main pane
        initializeUrlTree();
        initializeFileField();
        updateUrlAddButton();
        updateUrlRemoveButton();
        // Extension pane
        initializeDefaultAction();
        initializeExtensionTree();
        updateExtensionAddButton();
        updateExtensionRemoveButton();
    };

    ////////////////////////////////////////////////////
    // Main pane
    var SVN_PATH_PREF_ID = "svn_path_pref";
    var URL_LIST_PREF_ID = "url_list_pref";
    var URL_TREE_CHECKBOX_INDEX = 0;
    var initializeUrlTree = function(){
        var elem = document.getElementById(URL_LIST_PREF_ID);
        if (!elem){
            return;
        }

        var string = elem.value;
        if (!string){
            return;
        }

        string.split("\n").forEach(function(v, i, ary){
            if (i % 2 == 0){
                addUrlTreeItem(v, ary[i+1]!="0");
            }
        });

        initializeUrlTreeEvent();
    };

    var initializeUrlTreeEvent = function(){
        var url_list_tree = document.getElementById("url_list_tree");
        if (!url_list_tree){
            return;
        }

        // To save editable checkbox.
        url_list_tree.addEventListener("click", function(e){
            var treebox = url_list_tree.treeBoxObject;
            // If treebox is got correctly, check clicked point for needless update of pref.
            if (treebox){
                var row = {}, col = {};
                if (treebox.getCellAt(e.clientX, e.clientY, row, col, {}) == -1
                     || row.value == -1 || col.value.index != URL_TREE_CHECKBOX_INDEX){
                    return;
                }
            }
            saveUrlTree();
        }, false);

        // To save editable textbox.
        url_list_tree.addEventListener("change", function(e){
            saveUrlTree();
        }, false);
    };

    var initializeFileField = function(){
        var elem = document.getElementById(SVN_PATH_PREF_ID);
        if (!elem){
            return;
        }

        var file = elem.value;
        if (!file){
            return;
        }
        updateFileField(file);
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

        updateUrlAddButton();
        saveUrlTree();
    };

    var removeUrl = function(){
        var url_list_tree = document.getElementById("url_list_tree");
        var url_list_treechildren = document.getElementById("url_list_treechildren");
        removeSelectedItem(url_list_tree, url_list_treechildren);
        saveUrlTree();
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

        // update URL info
        var elem = document.getElementById(URL_LIST_PREF_ID);
        if (elem){
            elem.value = data.join("\n");
        }
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

            // update pref value.
            var elem = document.getElementById(SVN_PATH_PREF_ID);
            if (elem){
                elem.value = file_picker.file;
            }
        }
    };

    var updateFileField = function(file){
        var file_field = document.getElementById("tortoise_svn_filefield");
        if (file_field){
            file_field.file = file;
            file_field.label = file.path;
        }
    };

    var updateUrlAddButton = function(){
        var url_textbox = document.getElementById("url_textbox");
        var add_url_button = document.getElementById("add_url_button");
        if (url_textbox && add_url_button){
            add_url_button.disabled = (url_textbox.value.trim().length == 0);
        }
    };

    var updateUrlRemoveButton = function(){
        var url_list_tree = document.getElementById("url_list_tree");
        var remove_url_button = document.getElementById("remove_url_button");
        if (url_list_tree && remove_url_button){
            remove_url_button.disabled = (url_list_tree.view.selection.count == 0);
        }
    };

    ////////////////////////////////////////////////////
    // Extension pane
    var DEFAULT_ACTION_PREF_ID = "default_action_pref";
    var EXTENSION_ACTIONS_PREF_ID = "extension_actions_pref";
    var ACTIONS = [ "browser", "log", "blame", "open_in_firefox" ];
    var initializeDefaultAction = function(){
        var default_action = document.getElementById("default_action_menulist");
        var pref = document.getElementById(DEFAULT_ACTION_PREF_ID);
        if (!default_action || !pref){
            return;
        }

        default_action.value = (ACTIONS.indexOf(pref.value) != -1 ? pref.value : ACTIONS[0]);
    };

    var saveDefaultAction = function(){
        var default_action = document.getElementById("default_action_menulist");
        var pref = document.getElementById(DEFAULT_ACTION_PREF_ID);
        if (!default_action || !pref){
            return;
        }

        pref.value = default_action.value;
    };

    var initializeExtensionTree = function(){
        var elem = document.getElementById(EXTENSION_ACTIONS_PREF_ID);
        if (!elem || !elem.value){
            return;
        }
        elem.value.split("\n").forEach(function(v, i, ary){
            if (i % 2 == 0){
                addExtensionTreeItem(v, ary[i+1]);
            }
        });
    };

    var addExtensionTreeItem = function(extension, action){
        var extension_list_treechildren = document.getElementById("extension_list_treechildren");
        var strings = document.getElementById("open_tortoise_svn_strings");
        if (!extension_list_treechildren || ACTIONS.indexOf(action) == -1 || !strings){
            return;
        }

        var item = document.createElement("treeitem");
        var row = document.createElement("treerow");
        var cell_extension = document.createElement("treecell");
        cell_extension.setAttribute("label", extension);
        var cell_action = document.createElement("treecell");
        cell_action.setAttribute("value", action);
        cell_action.setAttribute("label", strings.getString("action_" + action));

        row.appendChild(cell_extension);
        row.appendChild(cell_action);
        item.appendChild(row);
        extension_list_treechildren.appendChild(item);
    };

    var saveExtensionTree = function(){
        var extension_list_treechildren = document.getElementById("extension_list_treechildren");
        if (!extension_list_treechildren){
            return;
        }

        var data = [];
        for (var i=0; i<extension_list_treechildren.childNodes.length; i++){
            var treeitem = extension_list_treechildren.childNodes[i];
            var treerow = treeitem.firstChild;
            var cell_extension = treerow.firstChild;
            var cell_action = cell_extension.nextSibling;

            var extension_label = cell_extension.getAttribute("label").trim();
            var action_label = cell_action.getAttribute("value");
            if (extension_label.length > 0 && action_label.length > 0){
                data.push(extension_label);
                data.push(action_label);
            }
        }

        // update Extension info
        var elem = document.getElementById(EXTENSION_ACTIONS_PREF_ID);
        if (elem){
            elem.value = data.join("\n");
        }
    };

    var addExtension = function(){
        var extension_textbox = document.getElementById("extension_textbox");
        var extension_action_menulist = document.getElementById("extension_action_menulist");
        if (!extension_textbox || !extension_action_menulist){
            return;
        }

        if (extension_textbox.value.trim().length == 0
             || ACTIONS.indexOf(extension_action_menulist.value) == -1){
            return;
        }

        addExtensionTreeItem(extension_textbox.value.trim(), extension_action_menulist.value);
        extension_textbox.value = "";

        updateExtensionAddButton();
        saveExtensionTree();
    };

    var removeExtension = function(){
        var extension_list_tree = document.getElementById("extension_list_tree");
        var extension_list_treechildren = document.getElementById("extension_list_treechildren");
        removeSelectedItem(extension_list_tree, extension_list_treechildren);
        saveExtensionTree();
    };

    var updateExtensionAddButton = function(){
        var extension_textbox = document.getElementById("extension_textbox");
        var add_extension_button = document.getElementById("add_extension_button");
        if (extension_textbox && add_extension_button){
            add_extension_button.disabled = (extension_textbox.value.trim().length == 0);
        }
    };

    var updateExtensionRemoveButton = function(){
        var extension_list_tree = document.getElementById("extension_list_tree");
        var remove_extension_button = document.getElementById("remove_extension_button");
        if (extension_list_tree && remove_extension_button){
            remove_extension_button.disabled = (extension_list_tree.view.selection.count == 0);
        }
    };

    // common
    var removeSelectedItem = function(tree, treechildren){
        if (!tree || !treechildren){
            return;
        }

        var removed = [];
        for (var i=0; i<treechildren.childNodes.length; i++){
            if (tree.view.selection.isSelected(i)){
                removed.push(treechildren.childNodes[i]);
            }
        }
        removed.forEach(function(elem){
            treechildren.removeChild(elem);
        });
    };


    // publish functions
    return {
        // Main pane
        setPath: setPath,
        addUrl: addUrl,
        removeUrl: removeUrl,
        updateUrlAddButton: updateUrlAddButton,
        updateUrlRemoveButton: updateUrlRemoveButton,
        // Extension pane
        saveDefaultAction: saveDefaultAction,
        addExtension: addExtension,
        removeExtension: removeExtension,
        updateExtensionAddButton: updateExtensionAddButton,
        updateExtensionRemoveButton: updateExtensionRemoveButton,

        initialize: initialize
    };
})();

