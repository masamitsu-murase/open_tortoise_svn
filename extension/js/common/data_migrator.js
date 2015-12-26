var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const DATA_VERSION = 1;

    var DataMigrator = class {
        migrate() {
            return ctx.Misc.async(function*() {
                var needed = yield this.isMigrationFromLocalStorageNeeded();

                if (!needed) {
                    return;
                } else if (needed == "no_data") {
                    chrome.storage.local.set({ data_version: DATA_VERSION }, function() {
                    });
                    return;
                }

                try {
                    var value = JSON.parse(localStorage["saved_data"]);
                    this.updateVersion(value);

                    yield this.saveData(this.migrateLocalStorageValue(value));
                    localStorage["saved_data"] = "";
                } catch (e) {
                    console.error(e);
                }
            }, this);
        }

        isMigrationFromLocalStorageNeeded() {
            return new Promise(function(resolve, reject) {
                chrome.storage.local.get({ data_version: null }, function(obj) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    if (obj.data_version === null) {
                        var value = localStorage["saved_data"];
                        resolve(value ? true : "no_data");
                    } else {
                        resolve(false);
                    }
                });
            });
        }

        updateVersion(value) {
            switch(value.version){
              case "0.0.1":
                value.tortoise_svn_action = "C:\\Program Files\\TortoiseSVN\\bin\\TortoiseProc.exe";
              case "0.0.2":
                value.extension_actions = [];
              case "0.0.3":
              case "0.0.4":
              case "0.0.5":
              case "0.0.6":
              case "1.0.0":
            // 1.0.1
            }
            value.version = "1.0.1";
        }

        migrateLocalStorageValue(value) {
            var suffix_action = [];
            if (value.extension_actions.length > 0) {
                for (let item of value.extension_actions) {
                    try {
                        let text = item.extension.split(",").map(i => i.trim().replace(/^\*/, ""));
                        let action = item.action;
                        suffix_action.push([ text.map(i => `*${i}`).join(", "), action ]);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            var obj = {
              data_version: DATA_VERSION,
              action_matcher: {
                url_list: Array.from(value.added_url_list),
                suffix_action: suffix_action,
                default_action: value.tortoise_svn_action
              },

              misc_settings: {
                tsvn_path: value.tortoise_proc_path,
                help_tip_time: true
              }
            };

            return obj;
        }

        saveData(value) {
            return new Promise(function(resolve, reject) {
                chrome.storage.local.set(value, function() {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    resolve();
                });
            });
        }
    };

    ctx.DataMigrator = DataMigrator;
})(OpenTsvn);
