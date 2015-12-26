
(function() {
    "use strict";

    var ctx = OpenTsvn;

    describe("Proxy", function() {
        describe("TortoiseSvnOpenerProxy", function() {
            // white list
            const PRIVATE_METHODS
                = [ "tsvnPath", "runTortoiseSvn", "invokeNativeMessagingTsvn", "searchTsvnProcPath" ];

            it("should have same method as TortoiseSvnOpener", function() {
                var methods = Object.getOwnPropertyNames(ctx.TortoiseSvnOpener.prototype);
                methods.sort();

                var methods_proxy = Object.getOwnPropertyNames(ctx.TortoiseSvnOpenerProxy.prototype);
                methods_proxy = methods_proxy.concat(PRIVATE_METHODS);
                methods_proxy.sort();

                expect(methods_proxy).toEqual(methods);
            });
        });

        describe("BadgeManagerProxy", function() {
            // white list
            const PRIVATE_METHODS = [ "setText" ];

            it("should have same method as BadgeManager", function() {
                var methods = Object.getOwnPropertyNames(ctx.BadgeManager.prototype);
                methods.sort();

                var methods_proxy = Object.getOwnPropertyNames(ctx.BadgeManagerProxy.prototype);
                methods_proxy = methods_proxy.concat(PRIVATE_METHODS);
                methods_proxy.sort();

                expect(methods_proxy).toEqual(methods);
            });
        });
    });
})();
