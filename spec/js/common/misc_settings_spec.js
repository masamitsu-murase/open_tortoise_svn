
(function() {
    "use strict";

    var ctx = OpenTsvn;

    describe("MiscSettings", function() {
        it("can set tsvnPath", function() {
            var ms = new ctx.MiscSettings();

            var path = "C:\\test\\test.exe";
            ms.setTsvnPath(path);
            expect(ms.tsvnPath()).toBe(path);

            path = "  C:\\test\\test.exe   ";
            ms.setTsvnPath(path);
            expect(ms.tsvnPath()).toBe(path.trim());
        });

        it("can set helpTipTime", function() {
            var ms = new ctx.MiscSettings();

            ms.setHelpTipTime(true);
            expect(ms.helpTipTimeInMs()).toBe(ctx.MiscSettings.DEFAULT_HELP_TIP_TIME);
            expect(ms.isHelpTipTimeEnabled()).toBe(true);

            ms.setHelpTipTime(false);
            expect(ms.isHelpTipTimeEnabled()).toBe(false);

            ms.setHelpTipTime(1000);
            expect(ms.helpTipTimeInMs()).toBe(1000);
            expect(ms.isHelpTipTimeEnabled()).toBe(true);

            ms.setHelpTipTime(0);
            expect(ms.helpTipTimeInMs()).toBe(0);
            expect(ms.isHelpTipTimeEnabled()).toBe(true);
        });
    });
})();

