
(function() {
    "use strict";

    var ctx = OpenTsvn;

    describe("Misc", function() {
        describe("async", function() {
            it("can be called in a normal way", function() {
                var result = [];
                result.push(1);
                ctx.Misc.async(function*() {
                    result.push(2);
                });
                result.push(3);
                ctx.Misc.async(function*() {
                    result.push(4);
                });
                result.push(5);
                expect(result).toEqual([ 1, 2, 3, 4, 5 ]);
            });

            it("can wait for completion of Promise", function(done) {
                var result = [];
                result.push(1);
                ctx.Misc.async(function*() {
                    result.push(2);
                    yield new Promise(function(resolve, reject) {
                        setTimeout(function() {
                            result.push(4);
                            resolve();
                        }, 20);
                    });
                    result.push(5);
                    yield new Promise(function(resolve, reject) {
                        setTimeout(function() {
                            result.push(6);
                            resolve();
                        }, 10);
                    });
                    result.push(7);
                }).then(function() {
                    expect(result).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                    done();
                });
                result.push(3);
            });

            it("can get value from Promise", function(done) {
                var result = [];
                result.push(1);
                ctx.Misc.async(function*() {
                    var value = yield new Promise(function(resolve, reject) {
                        resolve(2);
                    });
                    result.push(value);

                    value = yield new Promise(function(resolve, reject) {
                        setTimeout(function() {
                            resolve(3);
                        }, 10);
                    });
                    result.push(value);
                }).then(function() {
                    expect(result).toEqual([ 1, 2, 3 ]);
                    done();
                });
            });

            it("can catch error", function(done) {
                var error = {};

                var result = [];
                result.push(1);
                ctx.Misc.async(function*() {
                    result.push(2);
                    throw error;
                    result.push(3);
                }).catch(function(e) {
                    expect(e).toBe(error);
                    result.push(4);

                    expect(result).toEqual([ 1, 2, 4 ]);
                    done();
                });
            });

            it("can throw error from Promise", function(done) {
                var error = {};

                var result = [];
                result.push(1);
                ctx.Misc.async(function*() {
                    try {
                        result.push(2);
                        yield new Promise(function(resolve, reject) {
                            reject(error);
                        });
                        result.push(3);
                    } catch (e) {
                        expect(e).toBe(error);
                        result.push(4);
                    }

                    try {
                        result.push(5);
                        yield new Promise(function(resolve, reject) {
                            result.push(6);
                            setTimeout(function() {
                                reject(error);
                            }, 10);
                        });
                        result.push(7);
                    } catch (e) {
                        expect(e).toBe(error);
                        result.push(8);
                    }
                }).then(function() {
                    expect(result).toEqual([ 1, 2, 4, 5, 6, 8 ]);
                    done();
                });
            });

            it("can specify this as a second argument", function() {
                var obj = {};
                var self = null;

                ctx.Misc.async(function*() {
                    self = this;
                }, obj);

                expect(self).toBe(obj);
            });
        });

        describe("reviver", function() {
            var Class1 = class {
                constructor(name) {
                    this._name = name;
                }

                toJSON() {
                    return {
                        "class": "Class1",
                        "name": this._name
                    };
                }

                static reviver(key, value) {
                    if (value.class === "Class1") {
                        return new Class1(value.name);
                    }
                    return value;
                }
            };

            var Class2 = class {
                constructor(name) {
                    this._name = name;
                }

                toJSON() {
                    return {
                        "class": "Class2",
                        "name": this._name
                    };
                }

                static reviver(key, value) {
                    if (value.class === "Class2") {
                        return new Class2(value.name);
                    }
                    return value;
                }
            };

            it("can revive JSON-ised object", function() {
                var class1 = JSON.stringify(new Class1("class1"));
                var rev1 = JSON.parse(class1, ctx.Misc.reviver([ Class1, Class2 ]));
                expect(rev1).toEqual(new Class1("class1"));
                expect(rev1).toEqual(jasmine.any(Class1));

                var class2 = JSON.stringify(new Class2("class2"));
                var rev2 = JSON.parse(class2, ctx.Misc.reviver([ Class1, Class2 ]));
                expect(rev2).toEqual(new Class2("class2"));
                expect(rev2).toEqual(jasmine.any(Class2));

                var obj = JSON.stringify({ "name": "object" });
                var rev = JSON.parse(obj, ctx.Misc.reviver([ Class1, Class2 ]));
                expect(rev).toEqual({ "name": "object" });
            });
        });

        describe("sleep", function() {
            it("can stall the execution", function(done) {
                var start = (new Date()).getTime();
                ctx.Misc.async(function*() {
                    yield ctx.Misc.sleep(100);
                    var end = (new Date()).getTime();

                    expect(end - start).toBeGreaterThan(90);
                    expect(end - start).toBeLessThan(110);
                    done();
                });
            });
        });

        describe("executeScript", function() {
        });

        describe("executeScripts", function() {
        });

        describe("insertCSS", function() {
        });

        describe("insertCSSes", function() {
        });
    });
})();

