
var chrome = null;

(function() {
    "use strict";

    var ctx = OpenTsvn;

    describe("MessageReceiver", function() {
        var Receiver1 = class Receiver1 {
            method1(arg1, arg2) {
                return {
                  method: "Receiver1::method1",
                  args: [ arg1, arg2 ]
                };
            }

            method2() {
                return {
                  method: "Receiver1::method2",
                  args: []
                };
            }
        };
        var Receiver2 = class Receiver2 {
            method1(arg1, arg2, arg3) {
                return new Promise(function(resolve, reject) {
                    resolve({
                      method: "Receiver2::method1",
                      args: [ arg1, arg2, arg3 ]
                    });
                });
            }

            method2(arg1) {
                throw new ctx.TsvnError("test_message");
            }

            method3(arg1) {
                throw "test_message2";
            }
        };

        const sender_sym = Symbol();
        var Receiver1Proxy = class {
            constructor() {
                this[sender_sym] = new ctx.MessageSender("Receiver1");
            }
        };
        [ "method1", "method2" ].forEach(function(func) {
            Receiver1Proxy.prototype[func] = function() {
                return this[sender_sym].send(func, Array.from(arguments));
            };
        });
        var Receiver2Proxy = class {
            constructor() {
                this[sender_sym] = new ctx.MessageSender("Receiver2");
            }
        };
        [ "method1", "method2", "method3" ].forEach(function(func) {
            Receiver2Proxy.prototype[func] = function() {
                return this[sender_sym].send(func, Array.from(arguments));
            };
        });

        var setChromeMock = function(done) {
            chrome = {
              runtime: {
                listener: null,

                onMessage: {
                  addListener: function(listener) {
                      chrome.runtime.listener = listener;
                  }
                },

                sendMessage: function(message, callback) {
                    var called = false;
                    var closed = false;
                    var sendResponse = function(response) {
                        if (closed) {
                            done.fail("sendResponse is closed");
                            return;
                        }
                        if (called) {
                            done.fail("duplicated call");
                            return;
                        }

                        called = true;
                        setTimeout(function() { callback(response); }, 0);
                    };

                    var result = chrome.runtime.listener(JSON.parse(JSON.stringify(message)), null,
                                                         sendResponse);
                    if (!result) {
                        closed = true;
                    }
                }
              },

              i18n: {
                getMessage: function(text) {
                    return text;
                }
              }
            };
        };


        ////////////////////////////////////////////////////////////////
        it("can handle request from MessageSender", function(done) {
            setChromeMock(done);

            new ctx.MessageReceiver([ new Receiver1, new Receiver2 ]);

            var r1 = new Receiver1Proxy();
            var r2 = new Receiver2Proxy();

            ctx.Misc.async(function*() {
                var expected;

                expected = { method: "Receiver1::method1", args: [ null, "abc" ] };
                expect(yield r1.method1(null, "abc")).toEqual(expected);

                expected = { method: "Receiver1::method2", args: [] };
                expect(yield r1.method2()).toEqual(expected);

                expected = { method: "Receiver2::method1", args: [ { check: "arg" }, "abc", 1234 ] };
                expect(yield r2.method1({ check: "arg" }, "abc", 1234)).toEqual(expected);

                var error = null;
                try {
                    yield r2.method2([ 1, 2, 3 ]);
                } catch (e) {
                    error = e;
                }
                expect(error instanceof ctx.TsvnError).toBeTruthy();
                expect(error.message).toBe("test_message");

                error = null;
                try {
                    yield r2.method3("abc");
                } catch (e) {
                    error = e;
                }
                expect(error).toBe("test_message2");

                done();
            });
        });
    });
})();

