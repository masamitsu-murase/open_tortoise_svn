var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const sender_sym = Symbol();

    var TortoiseSvnOpenerProxy = class {
        constructor() {
            this[sender_sym] = new ctx.MessageSender("TortoiseSvnOpener");
        }
    };
    [ "openLog", "openRepobrowser", "openBlame" ].forEach(function(func) {
        TortoiseSvnOpenerProxy.prototype[func] = function() {
            // async
            return this[sender_sym].send(func, Array.from(arguments));
        };
    });

    var BadgeManagerProxy = class {
        constructor() {
            this[sender_sym] = new ctx.MessageSender("BadgeManager");
        }
    };
    [ "showWarning" ].forEach(function(func) {
        BadgeManagerProxy.prototype[func] = function() {
            // async
            return this[sender_sym].send(func, Array.from(arguments));
        };
    });


    ctx.TortoiseSvnOpenerProxy = TortoiseSvnOpenerProxy;
    ctx.BadgeManagerProxy = BadgeManagerProxy;
})(OpenTsvn);

