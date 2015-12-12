var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const root_sym = Symbol();
    const matcher_sym = Symbol();
    const help_tip_time_sym = Symbol();
    const tsvn_sym = Symbol();
    const badge_sym = Symbol();

    var IconDecorator = class IconDecorator {
        constructor(root, matcher, help_tip_time) {
            this[root_sym] = root;
            this[matcher_sym] = matcher;
            this[help_tip_time_sym] = help_tip_time;

            this[tsvn_sym] = new ctx.TortoiseSvnOpenerProxy();
            this[badge_sym] = new ctx.BadgeManagerProxy();

            this.initializeEventListener();
        }

        initializeEventListener() {
            this[root_sym].addEventListener("mouseover", e => this.mouseover(e), false);
            this[root_sym].addEventListener("click", e => this.click(e), false);
        }

        findATagInAncestor(elem) {
            try {
                while (elem) {
                    if (elem.nodeType === Node.ELEMENT_NODE && elem.tagName.toUpperCase() === "A") {
                        return elem;
                    }
                    elem = elem.parentNode;
                }
            } catch (e) {
                console.error(e);
            }
            return null;
        }

        comeFromOutside(a_tag, come_from) {
            // "come_from == null" means that "come from outside of the browser".
            if (come_from && a_tag.contains(come_from)) {
                return false;
            }
            return true;
        }

        goToOutside(a_tag, go_to) {
            return this.comeFromOutside(a_tag, go_to);
        }

        decorate(pos, type) {
            if (this[help_tip_time_sym]) {
                new ctx.Icon(type, pos, this[help_tip_time_sym]);
            }
        }

        click(event) {
            ctx.Icon.unregisterCurrentIcon();

            var a_tag = this.findATagInAncestor(event.target);
            if (!a_tag) {
                return;
            }

            var action = this[matcher_sym].match(a_tag.href);
            if (!action) {
                return;
            }

            var a_tag_parser = new ctx.ATagParser(a_tag);
            action = (a_tag_parser.action || action);
            if (action === "open_in_browser") {
                return;
            }

            event.preventDefault();
            this.openTsvn(a_tag_parser, action);
        }

        mouseover(event) {
            this.mouseout({ target: event.relatedTarget, relatedTarget: event.target });

            var a_tag = this.findATagInAncestor(event.target);
            if (!a_tag) {
                return;
            }

            if (!this.comeFromOutside(a_tag, event.relatedTarget)) {
                return;
            }

            var action = this[matcher_sym].match(a_tag.href);
            if (!action) {
                return;
            }

            var a_tag_parser = new ctx.ATagParser(a_tag);
            action = (a_tag_parser.action || action);
            if (action === "open_in_browser") {
                return;
            }

            var pos = {
                x: event.clientX,
                y: event.clientY
            };
            this.decorate(pos, action);
        }

        mouseout(event) {
            var a_tag = this.findATagInAncestor(event.target);
            if (!a_tag) {
                return;
            }

            if (!this.goToOutside(a_tag, event.relatedTarget)) {
                return;
            }

            ctx.Icon.unregisterCurrentIcon();
        }

        openTsvn(atp, action) {
            return ctx.Misc.async(function*(){
                try {
                    switch (action) {
                      case "log":
                        yield this[tsvn_sym].openLog(atp.url, atp.start_rev, atp.end_rev);
                        break;
                      case "browser":
                        yield this[tsvn_sym].openRepobrowser(atp.url, atp.start_rev);
                        break;
                      case "blame":
                        yield this[tsvn_sym].openBlame(atp.url);
                        break;
                    }
                } catch (error) {
                    if (error instanceof ctx.TsvnError) {
                        yield this[badge_sym].showWarning(true);
                        this.warn(error);
                    }
                }
            }, this);
        }

        warn(error) {
            alert(error.message);
        }
    };

    ctx.IconDecorator = IconDecorator;
})(OpenTsvn);
