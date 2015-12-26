var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    ctx.Misc.async(function*() {
        var action_matcher = new ctx.ActionMatcher();
        var misc_settings = new ctx.MiscSettings();

        yield Promise.all([ action_matcher.load(), misc_settings.load() ]);

        var help_tip_time;
        if (misc_settings.isHelpTipTimeEnabled()) {
            help_tip_time = misc_settings.helpTipTimeInMs();
        } else {
            help_tip_time = false;
        }

        new ctx.IconDecorator(document.body, action_matcher, help_tip_time);
    });
})(OpenTsvn);
