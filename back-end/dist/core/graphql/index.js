"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectApolloServer = void 0;
const constants_1 = require("./../constants");
const dataLoaders_1 = require("./../../utils/dataLoaders");
const PostResolver_1 = require("./schema/resolvers/PostResolver");
const UserResolver_1 = require("./schema/resolvers/UserResolver");
const apollo_server_core_1 = require("apollo-server-core");
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const TestResolve_1 = require("./schema/resolvers/TestResolve");
const Error_1 = require("../Error");
const http_status_codes_1 = require("http-status-codes");
const connectApolloServer = async (app, connect) => {
    const connPostgres = await connect;
    if (constants_1.__prop__)
        await connPostgres.runMigrations();
    console.log('starting ApolloServer ... ');
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [TestResolve_1.TestResolver, UserResolver_1.UserResolver, PostResolver_1.PostResolver],
            validate: false,
        }).catch((e) => {
            console.log(e);
            throw new Error_1.AppError('Error Graphql Server fail build Schema', http_status_codes_1.StatusCodes.BAD_GATEWAY);
        }),
        context: ({ res, req }) => ({
            res,
            req,
            connect: connPostgres,
            dataLoaders: (0, dataLoaders_1.buildDataLoaders)(),
        }),
        plugins: [(0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)()],
    });
    await apolloServer.start().catch(() => {
        throw new Error_1.AppError('Error Graphql Server', http_status_codes_1.StatusCodes.BAD_GATEWAY);
    });
    apolloServer.applyMiddleware({ app, cors: false });
    console.log(`connected Apollo-server ${apolloServer.graphqlPath}`);
};
exports.connectApolloServer = connectApolloServer;
//# sourceMappingURL=index.js.map