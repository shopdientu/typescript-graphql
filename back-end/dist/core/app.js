"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const index_1 = require("./graphql/index");
const index_2 = require("./databases/mongo/index");
const index_3 = require("./databases/postgres/index");
const sessions_1 = require("./sessions");
const cors_1 = __importDefault(require("cors"));
class App {
    constructor(app) {
        this.app = app;
    }
    useApp(callback) {
        return this.app.use(callback);
    }
    startServerOnPort() {
        this.app.use((0, sessions_1.sessionMongoApp)());
        console.log('Started Session');
        const port = process.env.PORT || 5000;
        this.app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    }
    async run() {
        this.startServerOnPort();
        this.app.use((0, cors_1.default)({
            origin: constants_1.__prop__ ? process.env.CORS_PRO : process.env.CORS_DEV,
            credentials: true,
        }));
        return await Promise.all([(0, index_2.connectMongo)(), (0, index_1.connectApolloServer)(this.app, (0, index_3.connectPostgres)())]);
    }
    public() {
        return {};
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map