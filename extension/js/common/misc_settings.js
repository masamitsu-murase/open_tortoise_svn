var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const tsvn_path_sym = Symbol();
    const help_tip_time_sym = Symbol();

    const DEFAULT_HELP_TIP_TIME = 2000;  // ms

    var MiscSettings = class {
        constructor() {
            this[tsvn_path_sym] = "";
            this[help_tip_time_sym] = true;
        }

        load() {
            var self = this;
            return new Promise(function(resolve, reject) {
                var default_values = {
                  misc_settings: {
                    tsvn_path: "",
                    help_tip_time: true
                  }
                };
                chrome.storage.local.get(default_values, function(obj) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    try {
                        var ms = obj.misc_settings;
                        self.setTsvnPath(ms.tsvn_path);
                        self.setHelpTipTime(ms.help_tip_time);
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
                  misc_settings: {
                    tsvn_path: self.tsvnPath(),
                    help_tip_time: self.helpTipTime()
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

        tsvnPath() {
            return this[tsvn_path_sym];
        }

        setTsvnPath(tsvn_path) {
            this[tsvn_path_sym] = tsvn_path.trim();
        }

        helpTipTimeInMs() {
            if (this[help_tip_time_sym] === true) {
                return DEFAULT_HELP_TIP_TIME;
            } else if (this[help_tip_time_sym] === false) {
                return -1;
            } else {
                return this[help_tip_time_sym];
            }
        }

        helpTipTime() {
            return this[help_tip_time_sym];
        }

        isHelpTipTimeEnabled() {
            return (this[help_tip_time_sym] !== false);
        }

        setHelpTipTime(time_ms) {
            if (time_ms === true) {
                this[help_tip_time_sym] = true;
            } else if (time_ms === false) {
                this[help_tip_time_sym] = false;
            } else if (Number.isInteger(time_ms) && time_ms >= 0) {
                this[help_tip_time_sym] = time_ms;
            } else {
                throw new ctx.OperationError("invalid_time_ms", [ time_ms ]);
            }
        }
    };

    MiscSettings.DEFAULT_HELP_TIP_TIME = DEFAULT_HELP_TIP_TIME;

    ctx.MiscSettings = MiscSettings;
})(OpenTsvn);

