
var localStorage = {};
var chrome;

(function() {
    "use strict";

    var ctx = OpenTsvn;

    describe("DataMigrator", function() {
        const OLD_DATA = '{"tortoise_proc_path":"C:\\\\Program Files\\\\TortoiseSVN\\\\bin\\\\TortoiseProc.exe","tortoise_svn_action":"blame","added_url_list":["http://svn.ruby-lang.org/repos/ruby/"],"extension_actions":[{"extension":"*.json, *.js","action":"browser"},{"extension":"*.cpp","action":"log"}],"version":"1.0.1"}';

        var setChromeMock = function(local_get) {
            chrome = {
              storage: {
                local: {
                  get: local_get,
                  set: function(obj, callback) {
                      chrome.storage.local.data = obj;
                      setTimeout(callback, 0);
                  }
                }
              },
              runtime: {
                lastError: false
              }
            };
        };

        it("can detect the necessary of migration", function(done) {
            ctx.Misc.async(function*() {
                var migrator;

                localStorage["saved_data"] = OLD_DATA;
                setChromeMock(function(obj, callback) {
                    callback({ data_version: null });
                });
                migrator = new ctx.DataMigrator();
                expect(yield migrator.isMigrationFromLocalStorageNeeded()).toBe(true);

                localStorage["saved_data"] = OLD_DATA;
                setChromeMock(function(obj, callback) {
                    callback({ data_version: 1 });
                });
                migrator = new ctx.DataMigrator();
                expect(yield migrator.isMigrationFromLocalStorageNeeded()).toBe(false);

                localStorage["saved_data"] = "";
                setChromeMock(function(obj, callback) {
                    callback({ data_version: null });
                });
                migrator = new ctx.DataMigrator();
                expect(yield migrator.isMigrationFromLocalStorageNeeded()).toBe("no_data");

                done();
            });
        });

        it("can migrate old data", function(done) {
            ctx.Misc.async(function*() {
                var migrator = new ctx.DataMigrator();
                localStorage["saved_data"] = OLD_DATA;
                setChromeMock(function(obj, callback) {
                    callback({ data_version: null });
                });

                yield migrator.migrate();

                var expected = {
                  data_version: 1,
                  action_matcher: {
                    url_list: [ "http://svn.ruby-lang.org/repos/ruby/" ],
                    suffix_action: [ [ "*.json, *.js", "browser" ], [ "*.cpp", "log" ] ],
                    default_action: "blame"
                  },
                  misc_settings: {
                    tsvn_path: "C:\\Program Files\\TortoiseSVN\\bin\\TortoiseProc.exe",
                    help_tip_time: true
                  }
                };

                expect(chrome.storage.local.data).toEqual(expected);

                setChromeMock(function(obj, callback) {
                    callback(expected);
                });

                var am = new ctx.ActionMatcher();
                yield am.load();
                expect(am.urlList()).toEqual([ "http://svn.ruby-lang.org/repos/ruby/" ]);
                expect(am.suffixAction()).toEqual([ [ "*.json, *.js", "browser" ], [ "*.cpp", "log" ] ]);
                expect(am.defaultAction()).toBe("blame");

                var ms = new ctx.MiscSettings();
                yield ms.load();
                expect(ms.tsvnPath()).toBe("C:\\Program Files\\TortoiseSVN\\bin\\TortoiseProc.exe");
                expect(ms.helpTipTime()).toBe(true);

                done();
            });
        });
    });
})();

