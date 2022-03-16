"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const checkAuth = ({ context: { req } }, next) => {
    console.log(req.session.userId);
    if (!req.session.userId)
        throw new apollo_server_express_1.AuthenticationError('Not Authentication to perform Graphql operations');
    return next();
};
exports.checkAuth = checkAuth;
//# sourceMappingURL=checkAuth.js.map