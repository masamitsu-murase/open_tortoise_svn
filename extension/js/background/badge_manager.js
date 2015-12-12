var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const WARNING_TEXT = "!";
    const WARNING_COLOR = [ 255, 0, 0, 255 ];

    var BadgeManager = class BadgeManager {
        showWarning(enable) {
            if (enable) {
                this.setText(WARNING_TEXT, WARNING_COLOR);
            } else {
                this.setText("");
            }
        }

        setText(text, bg_color) {
            chrome.browserAction.setBadgeText({ text: text });
            if (bg_color) {
                chrome.browserAction.setBadgeBackgroundColor({ color: bg_color });
            }
        }
    };

    ctx.BadgeManager = BadgeManager;
})(OpenTsvn);
