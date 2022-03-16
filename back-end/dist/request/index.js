"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestApp = void 0;
class RequestApp {
    constructor(request) {
        this.token = request.session;
    }
}
exports.RequestApp = RequestApp;
//# sourceMappingURL=index.js.map