
var chrome;

(function() {
    "use strict";

    var ctx = OpenTsvn;

    describe("MessageSender", function() {
        var setChromeMock = function(sendMessage) {
            chrome = {
              runtime: {
                sendMessage: sendMessage,
                lastError: false
              },
              i18n: {
                getMessage: function(arg) {
                    return arg;
                }
              }
            };
        };

        it("can pass argument", function(done) {
            setChromeMock(function(message, callback) {
                var result;
                switch (message.sender) {
                  case "sender1":
                    result = {
                        sender: `sender: ${message.sender}`,
                        method: `method: ${message.method}`,
                        args:   `args: ${message.args.join(',')}`
                    };
                    break;
                }
                callback({ result: result });
            });

            ctx.Misc.async(function*() {
                var ms = new ctx.MessageSender("sender1");

                var ret = yield ms.send("method1", [ 1, 2, 3 ]);
                expect(ret).toEqual({ sender: "sender: sender1", method: "method: method1", args: "args: 1,2,3" });
                done();
            });
        });

        it("can handle lastError", function(done) {
            setChromeMock(function(message, callback) {
                chrome.runtime.lastError = "lastError";
                callback({ result: false });
            });

            ctx.Misc.async(function*() {
                var ms = new ctx.MessageSender("sender1");

                var error = null;
                try {
                    yield ms.send("method1", [ 1, 2, 3 ]);
                } catch (e) {
                    error = e;
                }
                expect(error).toBe("lastError");
                done();
            });
        });

        it("can handle exceptions", function(done) {
            ctx.Misc.async(function*() {
                var ms = new ctx.MessageSender("sender1");

                setChromeMock(function(message, callback) {
                    callback({ error: "Error String" });
                });

                var error = null;
                try {
                    yield ms.send("method1", [ 1, 2, 3 ]);
                } catch (e) {
                    error = e;
                }
                expect(error).toBe("Error String");

                setChromeMock(function(message, callback) {
                    callback({ error_json: JSON.stringify(new ctx.TsvnError("test")) });
                });

                var error = null;
                try {
                    yield ms.send("method1", [ 1, 2, 3 ]);
                } catch (e) {
                    error = e;
                }
                expect(error).toEqual(new ctx.TsvnError("test"));
                expect(error.message).toBe("test");

                done();
            });
        });
    });
})();

