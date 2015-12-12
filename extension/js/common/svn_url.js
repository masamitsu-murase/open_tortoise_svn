var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const SEARCH_PARAMS_SUPPORTED = (function() {
        var url = new URL("http://localhost/test?p=1");
        try {
            return (url.searchParams.get("p") === "1");
        } catch (e) {
            return false;
        }
    })();

    const url_sym = Symbol();

    var SvnUrl = class SvnUrl {
        constructor(url) {
            this[url_sym] = new URL(url);
        }

        get url() {
            return this[url_sym].href;
        }

        get p() {
            return this.param("p");
        }

        get r() {
            return this.param("r");
        }

        param(name) {
            if (SEARCH_PARAMS_SUPPORTED) {
                return this[url_sym].searchParams.get(name);
            } else {
                return SvnUrl.parseParam(this[url_sym].search, name);
            }
        }

        static parseParam(search, name) {
            try {
                var params = search.replace(/^\?/, '').split('&');
                for(let param of params) {
                    var pair = param.split('=', 2);
                    if (pair[0] === name) {
                        return pair[1];
                    }
                }
                return null;
            } catch (e) {
                return null;
            }
        }
    };

    ctx.SvnUrl = SvnUrl;
})(OpenTsvn);
