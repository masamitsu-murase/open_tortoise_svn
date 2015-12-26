var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    var $ = function(expression) {
        return document.querySelector(expression);
    };
    var i18n = function() {
        return chrome.i18n.getMessage.apply(chrome.i18n, Array.from(arguments));
    };

    const action_matcher_sym = Symbol();
    const misc_settings_sym = Symbol();

    var OptionPage = class OptionPage {
        constructor() {
            ctx.Misc.async(function*() {
                this[misc_settings_sym] = yield this.loadMiscSettings();
                this.setMiscSettingsToForm(this[misc_settings_sym]);

                this[action_matcher_sym] = yield this.loadActionMatcher();
                this.setActionMatcherToForm(this[action_matcher_sym]);

                this.initializeTabSwitcher();
                this.initializeEventHandlers();

                if (!($("#tortoise_proc_path").value)) {
                    try {
                        var path = yield this.searchTsvnProcPath();
                        if (path) {
                            $("#tortoise_proc_path").value = path;
                            this.addSaveHighlight();
                        }
                    } catch (e) {
                    }
                }
            }, this);
        }

        save() {
            ctx.Misc.async(function*() {
                this.clearSaveHighlight();

                this[misc_settings_sym].setTsvnPath($("#tortoise_proc_path").value);
                this[misc_settings_sym].setHelpTipTime($("#icon_indicator").checked);

                yield this.saveMiscSettings();
                yield this.saveActionMatcher();
            }, this);
        }

        saveMiscSettings() {
            return this[misc_settings_sym].save();
        }

        loadMiscSettings() {
            return ctx.Misc.async(function*() {
                var ms = new ctx.MiscSettings();
                yield ms.load();
                return ms;
            });
        }

        saveActionMatcher() {
            return this[action_matcher_sym].save();
        }

        loadActionMatcher() {
            return ctx.Misc.async(function*() {
                var am = new ctx.ActionMatcher();
                yield am.load();
                return am;
            });
        }

        clearSaveHighlight() {
            Array.from(document.getElementsByClassName("save_button")).forEach(item => {
                item.classList.remove("not_saved");
            });
        }

        addSaveHighlight() {
            Array.from(document.getElementsByClassName("save_button")).forEach(item => {
                item.classList.add("not_saved");
            });
        }

        addUrl(url) {
            var li = document.createElement("li");
            li.setAttribute("data-url", url);
            li.appendChild(document.createTextNode(url));

            var button = document.createElement("button");
            button.appendChild(document.createTextNode(i18n("Remove")));
            li.appendChild(button);

            $("#added_url_list").appendChild(li);
        }

        setUrlListToForm(url_list) {
            var elem = $("#added_url_list");
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
            url_list.forEach(url => this.addUrl(url));
        }

        setDefaultActionToForm(default_action) {
            $("#tortoise_svn_action").value = default_action;
        }

        addSuffixAction(suffix, action) {
            var td1 = document.createElement("td");
            td1.appendChild(document.createTextNode(suffix));

            var td2 = document.createElement("td");
            td2.appendChild(document.createTextNode(i18n(action)));

            var td3 = document.createElement("td");
            var button = document.createElement("button");
            button.appendChild(document.createTextNode(i18n("Remove")));
            td3.appendChild(button);

            var tr = document.createElement("tr");
            tr.setAttribute("data-suffix", suffix);
            tr.setAttribute("data-action", action);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);

            $("#suffix_action_list tbody").appendChild(tr);
        }

        setSuffixActionToForm(suffix_action) {
            var elem = $("#suffix_action_list tbody");
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
            suffix_action.forEach(sa => this.addSuffixAction(sa[0], sa[1]));
        }

        setMiscSettingsToForm(misc_settings) {
            $("#tortoise_proc_path").value = misc_settings.tsvnPath();
            $("#icon_indicator").checked = misc_settings.isHelpTipTimeEnabled();
        }

        setActionMatcherToForm(action_matcher) {
            this.setUrlListToForm(action_matcher.urlList());
            this.setDefaultActionToForm(action_matcher.defaultAction());
            this.setSuffixActionToForm(action_matcher.suffixAction());
            this.showActionTable(action_matcher.suffixAction().length > 0);
        }

        searchTsvnProcPath() {
            var tsvn = new ctx.TortoiseSvnOpener();
            return tsvn.searchTsvnProcPath();
        }

        initializeTabSwitcher() {
            var lis = Array.from(document.querySelectorAll("nav > ul > li"));
            var sections = Array.from(document.querySelectorAll("article > section"));
            if (lis.length != sections.length) {
                return;
            }

            for (let i=0; i<lis.length; i++) {
                let li = lis[i];
                let section = sections[i];
                li.addEventListener("click", function() {
                    lis.filter(item => (item !== li)).forEach(function(item) {
                        item.classList.remove("selected");
                    });
                    li.classList.add("selected");

                    sections.filter(item => (item !== section)).forEach(function(item) {
                        item.classList.remove("selected");
                    });
                    section.classList.add("selected");
                });
            }
        }

        showActionTable(tf) {
            if (tf) {
                $("#suffix_action_list").classList.add("show");
            } else {
                $("#suffix_action_list").classList.remove("show");
            }
        }

        initializeEventHandlers() {
            // save
            Array.from(document.getElementsByClassName("save_button")).forEach(item => {
                item.addEventListener("click", () => this.save());
            });
            // changed
            document.body.addEventListener("change", (event) => this.addSaveHighlight());
            // add url
            $("#add_url_button").addEventListener("click", (event) => {
                try {
                    this.addSaveHighlight();
                    var am = this[action_matcher_sym];
                    am.addUrl($("#added_url").value);
                    this.setUrlListToForm(am.urlList());
                    $("#added_url").value = "";
                } catch (e) {
                }
            });
            // remove url
            $("#added_url_list").addEventListener("click", (event) => {
                try {
                    var target = event.target;
                    if (!target.tagName || target.tagName.toLowerCase() !== "button") {
                        return;
                    }

                    this.addSaveHighlight();

                    var am = this[action_matcher_sym];
                    var li = target.parentNode;
                    am.removeUrl(li.getAttribute("data-url"));
                    this.setUrlListToForm(am.urlList());
                } catch (e) {
                }
            });
            // change default action
            $("#tortoise_svn_action").addEventListener("change", (event) => {
                this[action_matcher_sym].setDefaultAction($("#tortoise_svn_action").value);
            });
            // add suffix action
            $("#suffix_action_add_button").addEventListener("click", (event) => {
                try {
                    this.addSaveHighlight();
                    var suffix = $("#suffix_text").value;
                    if (suffix == "") {
                        return;
                    }

                    var am = this[action_matcher_sym];
                    am.addSuffixAction(suffix, $("#suffix_action").value);
                    this.setSuffixActionToForm(am.suffixAction());
                    $("#suffix_text").value = "";

                    this.showActionTable(am.suffixAction().length > 0);
                } catch (error) {
                }
            });
            // remove suffix action
            $("#suffix_action_list").addEventListener("click", (event) => {
                try {
                    var target = event.target;
                    if (!target.tagName || target.tagName.toLowerCase() !== "button") {
                        return;
                    }

                    this.addSaveHighlight();

                    var tr = target.parentNode.parentNode;
                    var suffix = tr.getAttribute("data-suffix");
                    var action = tr.getAttribute("data-action");
                    var am = this[action_matcher_sym];
                    am.removeSuffixAction(suffix, action);
                    this.setSuffixActionToForm(am.suffixAction());

                    this.showActionTable(am.suffixAction().length > 0);
                } catch (error) {
                }
            });
        }
    };

    document.addEventListener("DOMContentLoaded", function(event) {
        new OptionPage();
    });
})(OpenTsvn);

