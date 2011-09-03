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

(function(){
    var Cc = Components.classes;
    var Ci = Components.interfaces;
    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);

    var INFO_ATTRIBUTE1 = "data-tsvn-info";  // for HTML5
    var INFO_ATTRIBUTE2 = "rel";             // for HTML4.01

    var CALLBACKS = {
      browser: function(url, args){
          runTortoiseSvnBrowser(url);
      },

      log: function(url, args){
          runTortoiseSvnLog(url, args[0], args[1]);
      },

      blame: function(url, args){
          runTortoiseSvnBlame(url);
      }
    };

    var registerCallback = function(event){
        var appcontent = document.getElementById("appcontent"); // Firefox browser
        if (appcontent){
            appcontent.addEventListener("DOMContentLoaded", load, true);
		}
    };

    var load = function(event){
        if (!event || !event.originalTarget){
            return;
        }

        var doc = event.originalTarget;
        if (!isValidPage(doc)){
            return;
        }

        var body = doc.getElementsByTagName("body")[0];
        if (!body){
            return;
        }

        body.addEventListener("click", callbackClickEvent, true);
    };

    var callbackClickEvent = function(event){
        if (!processEvent(event)){
            return;
        }

        event.preventDefault();
    };

    var isValidPage = function(doc){
        try{
            var href = doc.location.href;
            var match_data = href.match(new RegExp("^(https?|file)://"));
            return !!match_data;
        }catch(e){
            return false;
        }
    };

    var processEvent = function(event){
        var element = event.originalTarget;

        return processAnchorTag(element);
    };

    var processAnchorTag = function(element){
        if (element.tagName.toLowerCase()!="a"){
            return false;
        }

        var url = element.getAttribute("href");
        if (!url || !isRegisteredUrl(url)){
            return false;
        }

        var callback_type = "browser";
        var callback_args = [];

        var info = element.getAttribute(INFO_ATTRIBUTE1);
        if (!info){
            info = element.getAttribute(INFO_ATTRIBUTE2);
        }
        if (info){
            var reg = /^\btsvn\[(.*?)\](?:\[(.*?)\])?$/;
            var match_data = info.match(reg);
            if (match_data){
                callback_type = match_data[1];
                if (match_data[2]){
                    callback_args = match_data[2].split(",");
                }
            }
        }

        var callback = CALLBACKS[callback_type];
        if (!callback){
            return false;
        }

        callback(url, callback_args);
        return true;
    };

    var isRegisteredUrl = function(url){
        var pref_name = "open_tortoise_svn.url_list_pref";
        if (!prefs.prefHasUserValue(pref_name)){
            return false;
        }
        var urls = prefs.getCharPref(pref_name).split("\n").filter(function(v, i, ary){
            return ((i % 2 == 0) && ary[i+1] != "0");
        });

        return urls.some(function(u){ return url.indexOf(u)==0; });
    };

    var runTortoiseSvnBrowser = function(repos){
        var args = ["/command:repobrowser", "/path:\"" + repos + "\""];
        runTortoiseSvn(args);
    };

    var runTortoiseSvnLog = function(repos, start_rev, end_rev){
        var args = ["/command:log", "/path:\"" + repos + "\""];
        if (start_rev || start_rev==="0"){
            args.push("/startrev:" + start_rev);
        }
        if (end_rev || end_rev==="0"){
            args.push("/endrev:" + end_rev);
        }

        runTortoiseSvn(args);
    };

    var runTortoiseSvnBlame = function(repos){
        var args = ["/command:blame", "/path:\"" + repos + "\""];
        runTortoiseSvn(args);
    };

    var runTortoiseSvn = function(args){
        var pref_name = "open_tortoise_svn.tortoise_svn_path_pref";
        if (!prefs.prefHasUserValue(pref_name)){
            return;
        }

        var path = prefs.getComplexValue(pref_name, Ci.nsILocalFile).path;
        runProgram(path, args);
    };

    var runProgram = function(program, args){
        var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
        file.initWithPath(program);
        var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
        try{
            process.init(file);
            process.run(false, args, args.length);
        }catch(e){
        }
    };

    window.addEventListener("load", registerCallback, false);
})();
