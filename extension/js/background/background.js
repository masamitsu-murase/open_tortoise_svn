var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    var opener = new ctx.TortoiseSvnOpener();
    var context_menu = new ctx.ContextMenu(opener);
    context_menu.registerHandler();

    var onInstalledCallback = function() {
        context_menu.createContextMenu();

        var data_migrator = new ctx.DataMigrator();
        data_migrator.migrate();
    };

    if (chrome.runtime.onInstalled) {
        chrome.runtime.onInstalled.addListener(onInstalledCallback);
    } else {
        // Firefox 50 does not support onInstalled.
        onInstalledCallback();
    }

    var badge_manager = new ctx.BadgeManager();

    new ctx.MessageReceiver([ opener, badge_manager ]);

    chrome.browserAction.onClicked.addListener(function() {
        badge_manager.showWarning(false);
        chrome.runtime.openOptionsPage();
    });
})(OpenTsvn);
