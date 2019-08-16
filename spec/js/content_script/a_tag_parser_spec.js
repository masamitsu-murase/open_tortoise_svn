
(function () {
    "use strict";

    var ctx = OpenTsvn;

    describe("ATagParser", function () {
        const URL = "http://example.com/svn";

        var createATagMock = function (url, param, attr) {
            var href = url + (param ? `?${param}` : "")
            return {
                "href": href,
                "getAttribute": function (key) {
                    return attr[key];
                }
            };
        };

        it("parse valid 'a' tag", function () {
            var parser;

            parser = new ctx.ATagParser(createATagMock(URL, null, { "data-tsvn-info": "tsvn[log]" }));
            expect(parser.url).toBe(URL);
            expect(parser.url_without_parameters).toBe(URL);
            expect(parser.action).toBe("log");
            expect(parser.start_rev).toBe(null);
            expect(parser.end_rev).toBe(null);

            parser = new ctx.ATagParser(createATagMock(URL, null, { "rel": "tsvn[blame]" }));
            expect(parser.url).toBe(URL);
            expect(parser.url_without_parameters).toBe(URL);
            expect(parser.action).toBe("blame");
            expect(parser.start_rev).toBe(null);
            expect(parser.end_rev).toBe(null);

            parser = new ctx.ATagParser(createATagMock(URL, null, { "data-tsvn-info": "tsvn[browser]" }));
            expect(parser.url).toBe(URL);
            expect(parser.url_without_parameters).toBe(URL);
            expect(parser.action).toBe("browser");
            expect(parser.start_rev).toBe(null);
            expect(parser.end_rev).toBe(null);

            parser = new ctx.ATagParser(createATagMock(URL, "p=123", { "data-tsvn-info": "tsvn[browser]" }));
            expect(parser.url).toBe(URL + "?p=123");
            expect(parser.url_without_parameters).toBe(URL);
            expect(parser.action).toBe("browser");
            expect(parser.start_rev).toBe(null);
            expect(parser.end_rev).toBe(null);

            parser = new ctx.ATagParser(createATagMock(URL, null, { "rel": "tsvn[open_in_browser]" }));
            expect(parser.url).toBe(URL);
            expect(parser.url_without_parameters).toBe(URL);
            expect(parser.action).toBe("open_in_browser");
            expect(parser.start_rev).toBe(null);
            expect(parser.end_rev).toBe(null);

            parser = new ctx.ATagParser(createATagMock(URL, null, { "data-tsvn-info": "tsvn[log][123]" }));
            expect(parser.url).toBe(URL);
            expect(parser.url_without_parameters).toBe(URL);
            expect(parser.action).toBe("log");
            expect(parser.start_rev).toBe("123");
            expect(parser.end_rev).toBe(null);

            parser = new ctx.ATagParser(createATagMock(URL, null, { "data-tsvn-info": "tsvn[log][123,23]" }));
            expect(parser.url).toBe(URL);
            expect(parser.url_without_parameters).toBe(URL);
            expect(parser.action).toBe("log");
            expect(parser.start_rev).toBe("123");
            expect(parser.end_rev).toBe("23");

            parser = new ctx.ATagParser(createATagMock(URL, "p=234&r=34", { "data-tsvn-info": "tsvn[log][123,23]" }));
            expect(parser.url).toBe(URL + "?p=234&r=34");
            expect(parser.url_without_parameters).toBe(URL);
            expect(parser.action).toBe("log");
            expect(parser.start_rev).toBe("123");
            expect(parser.end_rev).toBe("23");

            parser = new ctx.ATagParser(createATagMock(URL, null, { "rel": "tsvn[blame]" }));
            expect(parser.url).toBe(URL);
            expect(parser.url_without_parameters).toBe(URL);
            expect(parser.action).toBe("blame");
            expect(parser.start_rev).toBe(null);
            expect(parser.end_rev).toBe(null);
        });

        it("does not throw error for invalid tag", function () {
            var parser;

            parser = new ctx.ATagParser(createATagMock(URL, null, { check: "tsvn[lg]" }));
            expect(parser.url).toBe(URL);
            expect(parser.url_without_parameters).toBe(URL);
            expect(parser.action).toBe(null);
            expect(parser.start_rev).toBe(null);
            expect(parser.end_rev).toBe(null);
        });
    });
})();

