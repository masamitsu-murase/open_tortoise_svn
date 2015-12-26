
var chrome;

(function() {
    "use strict";

    var ctx = OpenTsvn;

    describe("Error", function() {
        var setChromeMock = function() {
            chrome = {
              i18n: {
                getMessage: function(arg) {
                    return arg;
                }
              }
            };
        };

        it("can revive", function() {
            setChromeMock();

            [ new ctx.OperationError("test"), new ctx.TsvnError("test") ].forEach(function(e) {
                var revived = JSON.parse(JSON.stringify(e), ctx.Misc.reviver(ctx.BaseError.ERRORS));
                expect(revived).toEqual(e);
                expect(revived.message).toBe(e.message);
            });
        });
    });
})();
