"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectError = void 0;
const BaseError_1 = require("./BaseError");
class ConnectError extends BaseError_1.BaseError {
    constructor(msg, statusCode) {
        super(msg);
        this.msg = msg;
        this.statusCode = statusCode;
    }
}
exports.ConnectError = ConnectError;
//# sourceMappingURL=connectError.js.map