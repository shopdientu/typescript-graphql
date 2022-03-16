"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = void 0;
const index_1 = require("./../../Error/index");
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_codes_1 = require("http-status-codes");
const connectMongo = async () => {
    await mongoose_1.default.connect(process.env.MONGO_URI).catch(() => {
        throw new index_1.AppError('error connect Postgres', http_status_codes_1.StatusCodes.BAD_GATEWAY);
    });
    console.log('Connected Mongo');
};
exports.connectMongo = connectMongo;
//# sourceMappingURL=index.js.map