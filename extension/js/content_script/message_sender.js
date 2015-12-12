var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const sender_name_sym = Symbol();

    var MessageSender = class MessageSender {
        constructor(sender_name) {
            this[sender_name_sym] = sender_name;
        }

        send(method, args) {
            var message = {
                sender: this[sender_name_sym],
                method: method,
                args: args
            };
            return new Promise(function(resolve, reject) {
                chrome.runtime.sendMessage(message, function(response) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    if (response.error_json) {
                        reject(JSON.parse(response.error_json, ctx.Misc.reviver(ctx.BaseError.ERRORS)));
                        return;
                    } else if (response.error) {
                        reject(response.error);
                        return;
                    }

                    resolve(response.result);
                });
            });
        }
    };

    ctx.MessageSender = MessageSender;
})(OpenTsvn);
