"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectPostgres = void 0;
const constants_1 = require("./../../constants");
const Upvote_1 = require("./entity/Upvote");
const index_1 = require("./../../Error/index");
const typeorm_1 = require("typeorm");
const http_status_codes_1 = require("http-status-codes");
const User_1 = require("./entity/User");
const Post_1 = require("./entity/Post");
const path_1 = __importDefault(require("path"));
const connectPostgres = async () => {
    console.log('connect PostGres');
    console.log(path_1.default.join(__dirname, '/migrations/*'));
    return await (0, typeorm_1.createConnection)(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ type: 'postgres' }, (constants_1.__prop__
        ? { url: process.env.DATABASE_URL }
        : {
            database: process.env.POSTGRES_DATABASE,
            username: process.env.POSTGRES_USERNAME,
            password: process.env.POSTGRES_PASSWORD,
        })), { logging: true }), (constants_1.__prop__ ? {} : { synchronize: true })), (constants_1.__prop__
        ? {
            extra: { ssl: { rejectUnauthorized: false } },
            ssl: true,
        }
        : {})), { entities: [User_1.User, Post_1.Post, Upvote_1.Upvote], migrations: [path_1.default.join(__dirname, '/migrations/*')] })).catch(() => {
        throw new index_1.AppError('Error connect postgres', http_status_codes_1.StatusCodes.BAD_GATEWAY);
    });
};
exports.connectPostgres = connectPostgres;
//# sourceMappingURL=index.js.map