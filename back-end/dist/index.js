"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const app_1 = __importDefault(require("./core/app"));
(async () => {
    try {
        const app = new app_1.default((0, express_1.default)());
        await app.run();
    }
    catch (e) {
        console.log(e);
        console.log({
            code: e.statusCode,
            msg: e.message,
        });
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map