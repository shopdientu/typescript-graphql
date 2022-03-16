"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionMongoApp = void 0;
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const express_session_1 = __importDefault(require("express-session"));
const constants_1 = require("../constants");
const sessionMongoApp = () => {
    console.log('session created');
    return (0, express_session_1.default)({
        name: process.env.COOKIE_NAME,
        store: connect_mongo_1.default.create({
            mongoUrl: process.env.MONGO_SESSION,
        }),
        cookie: {
            maxAge: 60 * 60 * 1000 * 24,
            httpOnly: true,
            secure: constants_1.__prop__,
            sameSite: 'lax',
            domain: constants_1.__prop__ ? '.vercel.app' : undefined,
        },
        secret: process.env.MONGO_SESSION,
        saveUninitialized: false,
        resave: false,
    });
};
exports.sessionMongoApp = sessionMongoApp;
//# sourceMappingURL=index.js.map