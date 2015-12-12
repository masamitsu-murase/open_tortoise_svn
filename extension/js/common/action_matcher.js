var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const URL_PATTERN = /^(https?:\/\/|file:\/\/)/;

    const url_list_sym = Symbol();
    const suffix_action_sym = Symbol();
    const default_action_sym = Symbol();

    var ActionMatcher = class ActionMatcher {
        constructor() {
            this[url_list_sym] = [];
            this[suffix_action_sym] = [];
            this[default_action_sym] = ActionMatcher.DEFAULT_ACTION_DEFAULT_VALUE;
        }

        match(raw_url) {
            try {
                if (!this[url_list_sym].some(i => (raw_url.substr(0, i.length) == i))) {
                    return null;
                }

                var url = new URL(raw_url);
                var suffix_action = this[suffix_action_sym].find(i => {
                    return i[0].some(suffix => (url.pathname.substr(-suffix.length) == suffix));
                });

                if (suffix_action) {
                    return suffix_action[1];
                } else {
                    return this[default_action_sym];
                }
            } catch (e) {
                console.error(e);
                return null;
            }
        }

        load() {
            var self = this;
            return new Promise(function(resolve, reject) {
                var default_values = {
                  action_matcher: {
                    url_list: [],
                    suffix_action: [],
                    default_action: ActionMatcher.DEFAULT_ACTION_DEFAULT_VALUE
                  }
                };
                chrome.storage.local.get(default_values, function(obj) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    try {
                        var am = obj.action_matcher;
                        self.setUrlList(am.url_list);
                        self.setSuffixAction(am.suffix_action);
                        self.setDefaultAction(am.default_action);
                        resolve();
                    } catch (e) {
                        console.error("Invalid data in storage");
                        reject(e);
                    }
                });
            });
        }

        save() {
            var self = this;
            return new Promise(function(resolve, reject) {
                var obj = {
                  action_matcher: {
                    url_list: self.urlList(),
                    suffix_action: self.suffixAction(),
                    default_action: self.defaultAction()
                  }
                };

                chrome.storage.local.set(obj, function() {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    resolve();
                });
            });
        }

        // [ "http://hoge", "file:///hogehoge/hoge" ]
        urlList() {
            return this[url_list_sym];
        }
        setUrlList(url_list) {
            ActionMatcher.validateUrlList(url_list);
            this[url_list_sym] = Array.from(url_list).map(i => ActionMatcher.preprocessUrl(i));
        }
        addUrl(url) {
            if (!ActionMatcher.isValidUrl(url)) {
                throw new ctx.OperationError("invalid_url_specified", [ url ]);
            }

            var processed_url = ActionMatcher.preprocessUrl(url);
            if (this[url_list_sym].indexOf(processed_url) >= 0) {
                throw new ctx.OperationError("duplicated_url_specified", [ url ]);
            }

            this[url_list_sym].push(processed_url);
        }
        removeUrl(url) {
            if (!ActionMatcher.isValidUrl(url)) {
                throw new ctx.OperationError("invalid_url_specified", [ url ]);
            }

            var processed_url = ActionMatcher.preprocessUrl(url);
            this[url_list_sym] = this[url_list_sym].filter(item => item !== processed_url);
        }


        // Input/Output format
        //   [ [ "*.html", ActionMatcher.ACTION_REPOBROWSER ], [ "*.txt, *.md", ActionMatcher.ACTION_BROWSER ] ]
        // Internal format
        //   [ [ [ ".html" ], ActionMatcher.ACTION_REPOBROWSER ], [ [ ".txt", ".md" ], ActionMatcher.ACTION_BROWSER ] ]
        suffixAction() {
            return this[suffix_action_sym].map(i => {
                return [ i[0].map(j => `*${j}`).join(", "), i[1] ];
            });
        }
        setSuffixAction(suffix_action) {
            ActionMatcher.validateSuffixAction(suffix_action);
            this[suffix_action_sym] = Array.from(suffix_action).map(i => {
                var suffix = i[0].split(",").map(j => j.trim().replace(/^\*/, ""));
                return [ suffix, i[1] ];
            });
        }
        addSuffixAction(suffix, action) {
            if (!ActionMatcher.isValidSuffixAction([ suffix, action ])) {
                throw new ctx.OperationError("invalid_suffix_action", [ suffix, action ]);
            }

            var processed_suffix = suffix.split(",").map(i => i.trim().replace(/^\*/, ""));
            if (this[suffix_action_sym].some(i => (i[0].join(",") === processed_suffix.join(",") && i[1] === action))) {
                throw new ctx.OperationError("duplicated_suffix_action", [ suffix, action ]);
            }

            this[suffix_action_sym].push([ processed_suffix, action ]);
        }
        removeSuffixAction(suffix, action) {
            if (!ActionMatcher.isValidSuffixAction([ suffix, action ])) {
                throw new ctx.OperationError("invalid_suffix_action", [ suffix, action ]);
            }

            var processed_suffix = suffix.split(",").map(i => i.trim().replace(/^\*/, ""));
            this[suffix_action_sym] = this[suffix_action_sym].filter(item => (item[0].join(",") !== processed_suffix.join(",") || item[1] !== action));
        }

        defaultAction() {
            return this[default_action_sym];
        }
        setDefaultAction(default_action) {
            ActionMatcher.validateDefaultAction(default_action);
            this[default_action_sym] = default_action;
        }

        static preprocessUrl(url) {
            return url.trim();
        }

        static isValidUrl(url) {
            var processed_url = ActionMatcher.preprocessUrl(url);
            if (!processed_url.match(URL_PATTERN)) {
                return false;
            }
            return true;
        }

        static validateUrlList(url_list) {
            for (let url of url_list) {
                if (!ActionMatcher.isValidUrl(url)) {
                    throw new ctx.OperationError("invalid_url_specified", [ url ]);
                }
            }
        }

        static isValidSuffixAction(suffix_action) {
            if (!suffix_action[0].match(/\s*\*?\.[_a-zA-Z0-9]+\s*(,\s*\*?\.[_a-zA-Z0-9]+\s*)*$/)) {
                return false;
            }

            const list = [ ActionMatcher.ACTION_BROWSER, ActionMatcher.ACTION_REPOBROWSER, ActionMatcher.ACTION_LOG, ActionMatcher.ACTION_BLAME ];
            if (list.indexOf(suffix_action[1]) < 0) {
                return false;
            }

            return true;
        }

        static validateSuffixAction(suffix_action) {
            for (let sa of suffix_action) {
                if (!ActionMatcher.isValidSuffixAction(sa)) {
                    throw new ctx.OperationError("invalid_suffix_action", [ sa[0], sa[1] ]);
                }
            }
        }

        static isValidDefaultAction(default_action) {
            const list = [ ActionMatcher.ACTION_BROWSER, ActionMatcher.ACTION_REPOBROWSER, ActionMatcher.ACTION_LOG, ActionMatcher.ACTION_BLAME ];
            if (list.indexOf(default_action) < 0) {
                return false;
            }

            return true;
        }

        static validateDefaultAction(default_action) {
            if (!ActionMatcher.isValidDefaultAction(default_action)) {
                throw new ctx.OperationError("invalid_default_action", [ default_action ]);
            }
        }
    };

    ActionMatcher.ACTION_BROWSER = "open_in_browser";
    ActionMatcher.ACTION_REPOBROWSER = "browser";
    ActionMatcher.ACTION_LOG = "log";
    ActionMatcher.ACTION_BLAME = "blame";
    ActionMatcher.DEFAULT_ACTION_DEFAULT_VALUE = ActionMatcher.ACTION_REPOBROWSER;

    ctx.ActionMatcher = ActionMatcher;
})(OpenTsvn);
