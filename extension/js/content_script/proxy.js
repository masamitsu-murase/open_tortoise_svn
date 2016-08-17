var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    // Current implementtion does not support getting property.
    var proxyCreator = function(sender_name) {
        // Constructor.
        return function() {
            var sender = new ctx.MessageSender(sender_name);

            // If a constructor returns an object, it is returned by "new" statement.
            return new Proxy({}, {
              get: function(target, property, receiver) {
                  return function() {
                      // async
                      return sender.send(property, Array.from(arguments));
                  };
              }
            });
        };
    };

    var TortoiseSvnOpenerProxy = proxyCreator("TortoiseSvnOpener");
    var BadgeManagerProxy = proxyCreator("BadgeManager");

    ctx.TortoiseSvnOpenerProxy = TortoiseSvnOpenerProxy;
    ctx.BadgeManagerProxy = BadgeManagerProxy;
})(OpenTsvn);

