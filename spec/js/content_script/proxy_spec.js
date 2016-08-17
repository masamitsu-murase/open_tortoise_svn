
var chrome;

(function() {
    "use strict";

    var ctx = OpenTsvn;

    describe("Proxy", function() {
        describe("TortoiseSvnOpenerProxy", function() {
            var setChromeMock = function() {
                chrome = {
                  runtime: {
                    sendMessage: function(message, callback) {
                        if (message.method == "openRepobrowser") {
                            callback({ result: message.args[0] });
                        } else {
                            callback({ error: "Unknown Method" });
                        }
                    }
                  }
                };
            };

            it("can call openRepobrowser via TortoiseSvnOpenerProxy", function(done) {
                var proxy = new ctx.TortoiseSvnOpenerProxy();
                ctx.Misc.async(function*() {
                    setChromeMock();

                    var rev = 123;
                    expect(yield proxy.openRepobrowser(rev)).toBe(rev);

                    done();
                });
            });

            it("throws error when XopenRepobrowser is called via TortoiseSvnOpenerProxy", function(done) {
                var proxy = new ctx.TortoiseSvnOpenerProxy();
                ctx.Misc.async(function*() {
                    setChromeMock();

                    var rev = 123;
                    var error_thrown = false;
                    try {
                        yield proxy.XopenRepobrowser(rev);
                    } catch (e) {
                        error_thrown = true;
                    }
                    expect(error_thrown).toBe(true);

                    done();
                });
            });
        });

        describe("BadgeManagerProxy", function() {
            var setChromeMock = function() {
                chrome = {
                  runtime: {
                    sendMessage: function(message, callback) {
                        if (message.method == "setText") {
                            callback({ result: message.args[0] });
                        } else {
                            callback({ error: "Unknown Method" });
                        }
                    }
                  }
                };
            };

            it("can call setText via BadgeManagerProxy", function(done) {
                var proxy = new ctx.BadgeManagerProxy();
                ctx.Misc.async(function*() {
                    setChromeMock();

                    var text = "Text Message";
                    expect(yield proxy.setText(text)).toBe(text);

                    done();
                });
            });
        });
    });
})();
