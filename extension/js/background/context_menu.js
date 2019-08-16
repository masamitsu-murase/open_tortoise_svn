var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function (ctx) {
    "use strict";

    const opener_sym = Symbol();

    var ContextMenu = class ContextMenu {
        constructor(opener) {
            this[opener_sym] = opener;
        }

        registerHandler() {
            chrome.contextMenus.onClicked.addListener(this.onContextMenu.bind(this));
        }

        createContextMenu() {
            chrome.contextMenus.create({
                title: "Open TortoiseSVN",
                contexts: ["page", "link"],
                id: "parent"
            });
            ["browser", "log", "blame", "open_in_browser"].forEach(function (type) {
                var obj = {
                    title: chrome.i18n.getMessage(`context_menu_${type}`),
                    contexts: (type === "open_in_browser" ? ["link"] : ["page", "link"]),
                    parentId: "parent",
                    id: type
                };
                chrome.contextMenus.create(obj);
            });
        }

        onContextMenu(info, tab) {
            ctx.Misc.async(function* () {
                try {
                    var svn_url;
                    if (info.linkUrl) {
                        svn_url = new ctx.SvnUrl(info.linkUrl);
                    } else if (info.pageUrl) {
                        svn_url = new ctx.SvnUrl(info.pageUrl);
                    } else {
                        return;
                    }

                    switch (info.menuItemId) {
                        case "browser":
                            yield this.openRepobrowser(svn_url);
                            break;
                        case "log":
                            yield this.openLog(svn_url);
                            break;
                        case "blame":
                            yield this.openBlame(svn_url);
                            break;
                        case "open_in_browser":
                            yield this.openBrowser(svn_url, tab);
                            break;
                    }
                } catch (e) {
                    console.error(e);
                }
            }, this);
        }

        openRepobrowser(svn_url) {
            // async
            return this[opener_sym].openRepobrowser(svn_url.url_without_parameters, (svn_url.p || svn_url.r));
        }

        openLog(svn_url) {
            // async
            return this[opener_sym].openLog(svn_url.url_without_parameters, (svn_url.p || svn_url.r), null);
        }

        openBlame(svn_url) {
            // async
            return this[opener_sym].openBlame(svn_url.url_without_parameters);
        }

        openBrowser(svn_url, tab) {
            return new Promise(function (resolve, reject) {
                chrome.tabs.update(tab.id, { url: svn_url.url }, function () {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    resolve();
                });
            });
        }
    };

    ctx.ContextMenu = ContextMenu;
})(OpenTsvn);
