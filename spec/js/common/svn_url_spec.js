
(function () {
    "use strict";

    var ctx = OpenTsvn;

    describe("SvnUrl", function () {
        it("can parse URL", function () {
            var svn_url = new ctx.SvnUrl("http://localhost:3000/test/path.html");
            expect(svn_url.url).toBe("http://localhost:3000/test/path.html");
            expect(svn_url.url_without_parameters).toBe("http://localhost:3000/test/path.html");
            expect(svn_url.p).toBe(null);
            expect(svn_url.r).toBe(null);
        });

        it("can parse URL without path", function () {
            var svn_url = new ctx.SvnUrl("http://localhost:3000");
            expect(svn_url.url).toBe("http://localhost:3000/");
            expect(svn_url.url_without_parameters).toBe("http://localhost:3000/");
            expect(svn_url.p).toBe(null);
            expect(svn_url.r).toBe(null);
        });

        it("can parse URL with parameters", function () {
            var svn_url = new ctx.SvnUrl("http://localhost:3000/test/path.html?test=123&p=123&r=456");
            expect(svn_url.url).toBe("http://localhost:3000/test/path.html?test=123&p=123&r=456");
            expect(svn_url.url_without_parameters).toBe("http://localhost:3000/test/path.html");
            expect(svn_url.p).toBe("123");
            expect(svn_url.r).toBe("456");
        });

        it("can parse URL with username", function () {
            var svn_url = new ctx.SvnUrl("http://user@localhost/test/path.html?test=123&p=123&r=456");
            expect(svn_url.url).toBe("http://user@localhost/test/path.html?test=123&p=123&r=456");
            expect(svn_url.url_without_parameters).toBe("http://localhost/test/path.html");
            expect(svn_url.p).toBe("123");
            expect(svn_url.r).toBe("456");
        });

        it("can parse URL with parameters and hash", function () {
            var svn_url = new ctx.SvnUrl("http://localhost:3000/test/path.html?test=123&p=123&r=456#top");
            expect(svn_url.url).toBe("http://localhost:3000/test/path.html?test=123&p=123&r=456#top");
            expect(svn_url.url_without_parameters).toBe("http://localhost:3000/test/path.html");
            expect(svn_url.p).toBe("123");
            expect(svn_url.r).toBe("456");
        });

        it("can parse file path", function () {
            var svn_url = new ctx.SvnUrl("file:///C:/work/svn/trunk");
            expect(svn_url.url).toBe("file:///C:/work/svn/trunk");
            expect(svn_url.url_without_parameters).toBe("file:///C:/work/svn/trunk");
            expect(svn_url.p).toBe(null);
            expect(svn_url.r).toBe(null);
        });
    });
})();

