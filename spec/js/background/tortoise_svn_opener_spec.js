
var chrome = null;

(function() {
    "use strict";

    var ctx = OpenTsvn;

    describe("TortoiseSvnOpener", function() {
        const URL = "http://example.com/svn";
        const TSVN_PATH = "C:\\Program Files\\TortoiseSvn\\bin\\TortoiseProc.exe";

        var createMock = function(invokeNMHandler) {
            var tsvn = new ctx.TortoiseSvnOpener();

            tsvn.tsvnPath = function() {
                return new Promise(function(resolve, reject) {
                    resolve(TSVN_PATH);
                });
            };

            if (invokeNMHandler) {
                tsvn.invokeNativeMessagingTsvn = function(obj) {
                    return new Promise(function(resolve, reject){
                        invokeNMHandler(obj, resolve, reject);
                    });
                };
            }

            return tsvn;
        };


        it("can return tsvnPath", function(done) {
            chrome = {
              storage: {
                local: {
                  get: function(values, callback) {
                      setTimeout(function() {
                          callback({
                            misc_settings: {
                              tsvn_path: TSVN_PATH,
                              help_tip_time: true
                            }
                          });
                      }, 0);
                  },
                },
              },
              runtime: {
                lastError: false
              }
            };

            var tsvn = new ctx.TortoiseSvnOpener();

            ctx.Misc.async(function*() {
                expect(yield tsvn.tsvnPath()).toBe(TSVN_PATH);
                done();
            });
        });

        it("can open Repository viewer", function(done) {
            var result = null;
            var tsvn = createMock(function(obj, resolve, reject) {
                result = obj;
                resolve(true);
            });

            var createResult = function(additional_args) {
                additional_args = (additional_args || []);
                return {
                  action: "tsvn",
                  path: TSVN_PATH,
                  args: [ "/command:repobrowser", `/path:${URL}` ].concat(additional_args)
                };
            };

            ctx.Misc.async(function*() {
                result = null;
                expect(yield tsvn.openRepobrowser(URL)).toBe(true);
                expect(result).toEqual(createResult());

                result = null;
                expect(yield tsvn.openRepobrowser(URL, 12345)).toBe(true);
                expect(result).toEqual(createResult([ "/rev:12345" ]));

                result = null;
                expect(yield tsvn.openRepobrowser(URL, 0)).toBe(true);
                expect(result).toEqual(createResult([ "/rev:0" ]));

                result = null;
                try {
                    yield tsvn.openRepobrowser();
                } catch (e) {
                    result = e;
                }
                expect(result).toBeTruthy();

                done();
            });
        });

        it("can open Log viewer", function(done) {
            var result = null;
            var tsvn = createMock(function(obj, resolve, reject) {
                result = obj;
                resolve(true);
            });

            var createResult = function(additional_args) {
                additional_args = (additional_args || []);
                return {
                  action: "tsvn",
                  path: TSVN_PATH,
                  args: [ "/command:log", `/path:${URL}` ].concat(additional_args)
                };
            };

            ctx.Misc.async(function*() {
                result = null;
                expect(yield tsvn.openLog(URL)).toBe(true);
                expect(result).toEqual(createResult());

                result = null;
                expect(yield tsvn.openLog(URL, 12345)).toBe(true);
                expect(result).toEqual(createResult([ "/startrev:12345" ]));

                result = null;
                expect(yield tsvn.openLog(URL, 12345, 23456)).toBe(true);
                expect(result).toEqual(createResult([ "/startrev:12345", "/endrev:23456" ]));

                result = null;
                expect(yield tsvn.openLog(URL, 0)).toBe(true);
                expect(result).toEqual(createResult([ "/startrev:0" ]));

                result = null;
                expect(yield tsvn.openLog(URL, 12345, 0)).toBe(true);
                expect(result).toEqual(createResult([ "/startrev:12345", "/endrev:0" ]));

                result = null;
                try {
                    yield tsvn.openLog();
                } catch (e) {
                    result = e;
                }
                expect(result).toBeTruthy();

                done();
            });
        });

        it("can open Blame viewer", function(done) {
            var result = null;
            var tsvn = createMock(function(obj, resolve, reject) {
                result = obj;
                resolve(true);
            });

            var createResult = function(additional_args) {
                additional_args = (additional_args || []);
                return {
                  action: "tsvn",
                  path: TSVN_PATH,
                  args: [ "/command:blame", `/path:${URL}` ].concat(additional_args)
                };
            };

            ctx.Misc.async(function*() {
                result = null;
                expect(yield tsvn.openBlame(URL)).toBe(true);
                expect(result).toEqual(createResult());

                result = null;
                try {
                    yield tsvn.openBlame();
                } catch (e) {
                    result = e;
                }
                expect(result).toBeTruthy();

                done();
            });
        });


        ////////////////////////////////////////////////////////////////
        it("can call invokeNativeMessagingTsvn", function(done) {
            chrome = {
              runtime: {},
              i18n: {
                getMessage: function(arg) {
                    return arg;
                }
              }
            };

            ctx.Misc.async(function*() {
                var tsvn = createMock();

                // Success
                chrome.runtime.sendNativeMessage = function(host, obj, callback) {
                    expect(host).toBe("masamitsu.murase.open_tortoise_svn");

                    chrome.runtime.lastError = null;
                    callback({ result: true, data: true });
                };
                expect(yield tsvn.openRepobrowser(URL)).toBe(true);

                // Failure 1
                chrome.runtime.sendNativeMessage = function(host, obj, callback) {
                    expect(host).toBe("masamitsu.murase.open_tortoise_svn");

                    chrome.runtime.lastError = "error1";
                    callback(null);
                };
                var error = null;
                try {
                    yield tsvn.openRepobrowser(URL);
                } catch (e) {
                    error = e;
                }
                expect(error instanceof ctx.TsvnError).toBe(true);

                // Failure 2
                chrome.runtime.sendNativeMessage = function(host, obj, callback) {
                    expect(host).toBe("masamitsu.murase.open_tortoise_svn");

                    chrome.runtime.lastError = null;
                    callback({ result: false, error: "error2" });
                };
                error = null;
                try {
                    yield tsvn.openRepobrowser(URL);
                } catch (e) {
                    error = e;
                }
                expect(error instanceof ctx.TsvnError).toBe(true);

                done();
            });
        });
    });
})();

