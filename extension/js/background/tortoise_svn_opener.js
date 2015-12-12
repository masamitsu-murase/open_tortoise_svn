var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const NATIVE_MESSAGING_HOST = "masamitsu.murase.open_tortoise_svn";

    const misc_settings_sym = Symbol();

    var TortoiseSvnOpener = class TortoiseSvnOpener {
        constructor() {
            this[misc_settings_sym] = new ctx.MiscSettings();
        }

        openRepobrowser(url, rev) {
            return ctx.Misc.async(function*() {
                var args = [];
                args.push("/command:repobrowser");

                if (!url) {
                    throw "Invalid url";
                }
                args.push(`/path:${url}`);

                if (rev || rev === 0) {
                    args.push(`/rev:${rev}`);
                }

                return yield this.runTortoiseSvn(args);
            }, this);
        }

        openLog(url, start_rev, end_rev) {
            return ctx.Misc.async(function*() {
                var args = [];
                args.push("/command:log");

                if (!url) {
                    throw "Invalid url";
                }
                args.push(`/path:${url}`);

                if (start_rev || start_rev === 0) {
                    args.push(`/startrev:${start_rev}`);
                }

                if (end_rev || end_rev === 0) {
                    args.push(`/endrev:${end_rev}`);
                }

                return yield this.runTortoiseSvn(args);
            }, this);
        }

        openBlame(url) {
            return ctx.Misc.async(function*() {
                var args = [];
                args.push("/command:blame");

                if (!url) {
                    throw "Invalid url";
                }
                args.push(`/path:${url}`);

                return yield this.runTortoiseSvn(args);
            }, this);
        }

        tsvnPath() {
            return ctx.Misc.async(function*() {
                yield this[misc_settings_sym].load();
                return this[misc_settings_sym].tsvnPath();
            }, this);
        }

        searchTsvnProcPath() {
            return ctx.Misc.async(function*() {
                var result = yield this.invokeNativeMessagingTsvn({ action: "search_tsvn" });
                return result;
            }, this);
        }

        runTortoiseSvn(args) {
            return ctx.Misc.async(function*() {
                var obj = {
                    action: "tsvn",
                    path: yield this.tsvnPath(),
                    args: args
                };
                return yield this.invokeNativeMessagingTsvn(obj);
            }, this);
        }

        invokeNativeMessagingTsvn(obj) {
            return new Promise(function(resolve, reject) {
                chrome.runtime.sendNativeMessage(NATIVE_MESSAGING_HOST, obj, function(response) {
                    if (chrome.runtime.lastError) {
                        console.warn(chrome.runtime.lastError);
                        reject(new ctx.TsvnError("native_messaging_host_error"));
                        return;
                    }

                    try {
                        if (response.result) {
                            resolve(response.data);
                        } else {
                            console.warn(response.error);
                            reject(new ctx.TsvnError("native_messaging_host_error"));
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        }
    };

    ctx.TortoiseSvnOpener = TortoiseSvnOpener;
})(OpenTsvn);
