var OpenTsvn;
if (!OpenTsvn) OpenTsvn = {};

(function(ctx) {
    "use strict";

    const message_sym = Symbol();
    const raw_sym = Symbol();

    var BaseError = class BaseError {
        constructor(message, args) {
            if (args === raw_sym) {
                this[message_sym] = message;
            } else if (args) {
                this[message_sym] = chrome.i18n.getMessage(message, args);
            } else {
                this[message_sym] = chrome.i18n.getMessage(message);
            }
        }

        get message() {
            return this[message_sym];
        }

        toJSON() {
            return {
                "class": this.constructor.name,
                "message": this.message
            };
        }

        static reviver(key, value) {
            if (value["class"] !== this.name) {
                return value;
            }

            return new this(value.message, raw_sym);
        }
    };

    var OperationError = class OperationError extends BaseError {
    };
    var TsvnError = class TsvnError extends BaseError {
    };

    BaseError.ERRORS = [ OperationError, TsvnError ];

    ctx.BaseError = BaseError;
    ctx.OperationError = OperationError;
    ctx.TsvnError = TsvnError;
})(OpenTsvn);

