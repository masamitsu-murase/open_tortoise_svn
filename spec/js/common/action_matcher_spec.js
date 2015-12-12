
(function() {
    "use strict";

    var ctx = OpenTsvn;

    describe("ActionMatcher", function() {
        const URL_LIST = [ "http://example.com/svn", "file:///C:/work/svn/trunk", "https://example.com/svn2" ];
        const SUFFIX_ACTION = [
            [ "*.html, *.htm", ctx.ActionMatcher.ACTION_BROWSER ],
            [ "*.c, *.cpp, *.h", ctx.ActionMatcher.ACTION_LOG ],
            [ "*.txt", ctx.ActionMatcher.ACTION_BLAME ]
        ];

        var createDefaultActionMatcher = function() {
            var am = new ctx.ActionMatcher();
            am.setUrlList(URL_LIST);
            am.setSuffixAction(SUFFIX_ACTION);
            am.setDefaultAction(ctx.ActionMatcher.ACTION_REPOBROWSER);
            return am;
        };

        describe("match", function() {
            it("matches valid URLs", function() {
                var am = createDefaultActionMatcher();
                expect(am.match("http://example.com/svn/"))
                    .toBe(ctx.ActionMatcher.ACTION_REPOBROWSER);
                expect(am.match("http://example.com/svn/test"))
                    .toBe(ctx.ActionMatcher.ACTION_REPOBROWSER);
                expect(am.match("file:///C:/work/svn/trunk/dir/file1.txt"))
                    .toBe(ctx.ActionMatcher.ACTION_BLAME);
                expect(am.match("file:///C:/work/svn/trunk/dir/file2.c"))
                    .toBe(ctx.ActionMatcher.ACTION_LOG);
                expect(am.match("https://example.com/svn2/sample_dir/sample.htm"))
                    .toBe(ctx.ActionMatcher.ACTION_BROWSER);

                expect(am.match("https://example.com/svn2/sample_dir/sample.cxx"))
                    .toBe(ctx.ActionMatcher.ACTION_REPOBROWSER);
            });

            it("does not match invalid URLs", function() {
                var am = createDefaultActionMatcher();
                expect(am.match("http://www.example.com/svn/test")).toBe(null);
                expect(am.match("file:///C:/work/svn/branch/sample.cpp")).toBe(null);
            });
        });

        describe("load", function() {
        });

        describe("save", function() {
        });

        describe("URL list", function() {
            it("returns valid URL list", function() {
                var am = createDefaultActionMatcher();
                expect(am.urlList()).toEqual(URL_LIST);
            });

            it("can add URL", function() {
                var am = createDefaultActionMatcher();
                am.addUrl("http://localhost/test");
                var url_list = URL_LIST.concat([ "http://localhost/test" ]);
                expect(am.urlList()).toEqual(url_list);
            });

            it("throws error if duplicated URL or invalid URL is added", function() {
                var am = createDefaultActionMatcher();
                expect(function() { am.addUrl(URL_LIST[1]); }).toThrow();
                expect(function() { am.addUrl("ws://example.com"); }).toThrow();
                expect(am.urlList()).toEqual(URL_LIST);
            });

            it("can remove URL", function() {
                var am = createDefaultActionMatcher();
                am.removeUrl(URL_LIST[2]);
                var url_list = [ URL_LIST[0], URL_LIST[1] ];
                expect(am.urlList()).toEqual(url_list);
            });

            it("throws error if invalid URL is removed", function() {
                var am = createDefaultActionMatcher();
                expect(function() { am.removeUrl("ws://example.com"); }).toThrow();
                expect(am.urlList()).toEqual(URL_LIST);
            });
        });

        describe("Suffix Action", function() {
            it("returns suffix action", function() {
                var am = createDefaultActionMatcher();
                expect(am.suffixAction()).toEqual(SUFFIX_ACTION);
            });

            it("can add suffix action", function() {
                var am = createDefaultActionMatcher();
                am.addSuffixAction("*.rb, *.py", ctx.ActionMatcher.ACTION_BLAME);
                var sa = SUFFIX_ACTION.concat([ [ "*.rb, *.py", ctx.ActionMatcher.ACTION_BLAME ] ]);
                expect(am.suffixAction()).toEqual(sa);

                am.addSuffixAction(" *.pl ", ctx.ActionMatcher.ACTION_LOG);
                sa = sa.concat([ [ "*.pl", ctx.ActionMatcher.ACTION_LOG ] ]);
                expect(am.suffixAction()).toEqual(sa);

                am.addSuffixAction(" .java ", ctx.ActionMatcher.ACTION_LOG);
                sa = sa.concat([ [ "*.java", ctx.ActionMatcher.ACTION_LOG ] ]);
                expect(am.suffixAction()).toEqual(sa);
            });

            it("throws error if invalid suffix or action is specified", function() {
                var am = createDefaultActionMatcher();
                expect(function() { am.addSuffixAction("txt", ctx.ActionMatcher.ACTION_LOG) })
                    .toThrow();
                expect(function() { am.addSuffixAction("*.css", "invalid_action") }).toThrow();
            });

            it("can remove suffix action", function() {
                var am = createDefaultActionMatcher();
                am.removeSuffixAction(SUFFIX_ACTION[2][0], SUFFIX_ACTION[2][1]);
                expect(am.suffixAction()).toEqual([ SUFFIX_ACTION[0], SUFFIX_ACTION[1] ]);
            });

            it("throws error if invalid action is removed", function() {
                var am = createDefaultActionMatcher();
                expect(function() { am.removeSuffixAction("txt", ctx.ActionMatcher.ACTION_LOG); })
                    .toThrow();
                expect(function() { am.removeSuffixAction("*.txt", "invalid_action"); })
                    .toThrow();
            });
        });

        describe("Default Action", function() {
            it("returns default action", function() {
                var am = createDefaultActionMatcher();
                expect(am.defaultAction()).toBe(ctx.ActionMatcher.ACTION_REPOBROWSER);
            });

            it("can set default action", function() {
                var am = createDefaultActionMatcher();
                am.setDefaultAction(ctx.ActionMatcher.ACTION_LOG);
                expect(am.defaultAction()).toBe(ctx.ActionMatcher.ACTION_LOG);
            });

            it("rejects invalid action", function() {
                var am = createDefaultActionMatcher();
                expect(function() { am.setDefaultAction("invalid_action"); }).toThrow();
                expect(am.defaultAction()).toBe(ctx.ActionMatcher.ACTION_REPOBROWSER);
            });
        });
    });
})();

