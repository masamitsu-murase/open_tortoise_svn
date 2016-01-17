var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const ICON_CLASS = "open_tortoise_svn_icon";
    const ICON_HEIGHT = 30;
    const ICON_BORDER = 0;
    const ICON_MARGIN = 2;

    const FADE_OUT_TIME_MSEC = 400;
    const FADE_OUT_CLASS = "open_tortoise_svn_icon_fadeout";

    const div_sym = Symbol();
    const current_icon_sym = Symbol();
    const mouse_move_event_registered_sym = Symbol();

    var Icon = class Icon {
        constructor(type, pos, timeout) {
            var root = document.body;
            var div = document.createElement("div");
            div.classList.add(ICON_CLASS);
            var img = document.createElement("img");
            img.src = chrome.runtime.getURL(chrome.i18n.getMessage(`icon_path_${type}`));
            div.appendChild(img);
            root.appendChild(div);

            this[div_sym] = div;
            this.setPos(pos.x, pos.y);

            ctx.Misc.async(function*() {
                Icon.registerCurrentIcon(this);
                yield ctx.Misc.sleep(timeout);
                this.fadeOut();
                yield ctx.Misc.sleep(FADE_OUT_TIME_MSEC);
                this.destroy();
            }, this);
        }

        setPos(x, y) {
            if (this[div_sym]) {
                this[div_sym].style.left = `${x + ICON_MARGIN}px`;
                this[div_sym].style.top  = `${Math.max(y - ICON_HEIGHT - ICON_BORDER * 2 - ICON_MARGIN, 0)}px`;
            }
        }

        fadeOut() {
            if (this[div_sym]) {
                this[div_sym].classList.add(FADE_OUT_CLASS);
            }
        }

        destroy() {
            if (this[div_sym]) {
                var div = this[div_sym];
                this[div_sym] = null;
                div.parentNode.removeChild(div);

                Icon.unregisterCurrentIcon(this);
            }
        }

        static registerCurrentIcon(icon) {
            this.addMouseMoveEventListener();

            this.unregisterCurrentIcon();
            this[current_icon_sym] = icon;
        }

        static unregisterCurrentIcon(target_icon) {
            if (target_icon === undefined || this[current_icon_sym] === target_icon) {
                var icon = this[current_icon_sym];
                if (icon) {
                    this[current_icon_sym] = null;
                    icon.destroy();
                }
            }
        }

        static addMouseMoveEventListener() {
            if (this[mouse_move_event_registered_sym]) {
                return;
            }

            this[mouse_move_event_registered_sym] = true;
            document.body.addEventListener("mousemove", (event) => {
                var icon = this[current_icon_sym];
                if (!icon) {
                    return;
                }

                icon.setPos(event.clientX, event.clientY);
            });
        }
    };

    ctx.Icon = Icon;
})(OpenTsvn);
