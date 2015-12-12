var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const url_sym = Symbol();
    const action_sym = Symbol();
    const start_rev_sym = Symbol();
    const end_rev_sym = Symbol();

    const ATTR_HTML5 = "data-tsvn-info";
    const ATTR_OLD = "rel";
    const ATTR_PATTERN = /^tsvn\[([_a-z]+)\](\[([0-9]+)(,([0-9]+))?\])?$/;

    var ATagParser = class {
        constructor(a_tag) {
            this[url_sym] = a_tag.href;
            this[action_sym] = null;
            this[start_rev_sym] = null;
            this[end_rev_sym] = null;

            this.parse(a_tag);
        }

        parse(a_tag) {
            var attr = a_tag.getAttribute(ATTR_HTML5);
            if (!attr) {
                attr = a_tag.getAttribute(ATTR_OLD);
            }
            if (!attr) {
                return;
            }

            var match_data = attr.match(ATTR_PATTERN);
            if (!match_data) {
                return;
            }

            this[action_sym] = match_data[1];
            if (match_data[3]) {
                this[start_rev_sym] = match_data[3];
            }
            if (match_data[5]) {
                this[end_rev_sym] = match_data[5];
            }
        }

        get url() {
            return this[url_sym];
        }

        get action() {
            return this[action_sym];
        }

        get start_rev() {
            return this[start_rev_sym];
        }

        get end_rev() {
            return this[end_rev_sym];
        }
    };

    ctx.ATagParser = ATagParser;
})(OpenTsvn);
