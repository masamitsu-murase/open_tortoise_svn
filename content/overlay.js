
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

    var TARGET_CLASS_NAME = "open_tsvn_link";
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
        if (!isValidClickEvent(event)){
            return;
        }

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

    var isValidClickEvent = function(event){
        return isValidElement(event.originalTarget);
    };

    var isValidElement = function(element){
        try{
            if (element.tagName.toLowerCase()!="a" || !element.getAttribute("href")){
                return false;
            }

            return true;
        }catch(e){
            return false;
        }
    };

    var processEvent = function(event){
        var element = event.originalTarget;

        if (processNormalUrl(element)){
            return true;
        }

        if (processRegisteredUrl(element)){
            return true;
        }

        return false;
    };

    var processNormalUrl = function(element){
        if (element.className.split(/\s+/).every(function(i){ return i!=TARGET_CLASS_NAME; })){
            return false;
        }

        var info = element.getAttribute(INFO_ATTRIBUTE1);
        if (!info){
            info = element.getAttribute(INFO_ATTRIBUTE2);
            if (!info){
                return false;
            }
        }

        var url = element.getAttribute("href");
        if (!url){
            return false;
        }

        var reg = /^tsvn\[([^\]]*)\](?:\[(.*)\])?$/;
        var match_data = info.match(reg);
        if (!match_data){
            return false;
        }

        var callback = CALLBACKS[match_data[1]];
        if (!callback){
            return false;
        }

        callback(url, match_data[2] ? match_data[2].split(",") : []);
        return true;
    };

    var processRegisteredUrl = function(element){
        var pref_name = "open_tortoise_svn.url_list_pref";
        if (!prefs.prefHasUserValue(pref_name)){
            return false;
        }
        var urls = prefs.getCharPref(pref_name).split("\n").filter(function(v, i, ary){
            return ((i % 2 == 0) && ary[i+1] != "0");
        });

        var url = element.getAttribute("href");
        if (urls.every(function(i){ return url.indexOf(i)!=0; })){
            return false;
        }

        runTortoiseSvnBrowser(url);
        return true;
    };

    var runTortoiseSvnBrowser = function(repos){
        var args = ["/command:repobrowser", "/path:" + repos];
        runTortoiseSvn(args);
    };

    var runTortoiseSvnLog = function(repos, start_rev, end_rev){
        var args = ["/command:log", "/path:" + repos];
        if (start_rev || start_rev==="0"){
            args.push("/startrev:" + start_rev);
        }
        if (end_rev || end_rev==="0"){
            args.push("/endrev:" + end_rev);
        }

        runTortoiseSvn(args);
    };

    var runTortoiseSvnBlame = function(repos){
        var args = ["/command:blame", "/path:" + repos];
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
