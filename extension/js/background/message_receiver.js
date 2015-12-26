var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const send_response_sym = Symbol();
    const called_sym = Symbol();

    var MessageResponse = class MessageResponse {
        constructor(send_response) {
            this[send_response_sym] = send_response;
            this[called_sym] = false;
        }

        send(response) {
            this[called_sym] = true;
            return this[send_response_sym](response);
        }

        isCalled() {
            return this[called_sym];
        }
    };


    ////////////////////////////////////////////////////////////////
    const receivers_sym = Symbol();

    var MessageReceiver = class MessageReceiver {
        constructor(receivers) {
            this[receivers_sym] = {};
            for (let receiver of receivers) {
                if (!(receiver.constructor.name)) {
                    throw "constructor must have valid name";
                }
                this[receivers_sym][receiver.constructor.name] = receiver;
            }

            chrome.runtime.onMessage.addListener(this.listener.bind(this));
        }

        listener(request, sender, sendResponse) {
            var response = new MessageResponse(sendResponse);
            ctx.Misc.async(function*() {
                try {
                    var receiver = this[receivers_sym][request.sender];
                    var args = request.args;
                    var ret = receiver[request.method].apply(receiver, args);
                    if (ret instanceof Promise) {
                        ret = yield ret;
                    }
                    if (ret === undefined) {
                        ret = null;  // Fail safe. JSON does not accept undefined.
                    }
                    response.send({ result: ret });
                } catch (e) {
                    console.warn(e);
                    if (e instanceof ctx.BaseError) {
                        response.send({ error_json: JSON.stringify(e) });
                    } else {
                        response.send({ error: e });
                    }
                }
            }, this);
            return !response.isCalled();
        }
    };

    ctx.MessageReceiver = MessageReceiver;
})(OpenTsvn);
