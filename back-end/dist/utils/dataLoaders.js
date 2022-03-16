"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDataLoaders = void 0;
const Upvote_1 = require("./../core/databases/postgres/entity/Upvote");
const dataloader_1 = __importDefault(require("dataloader"));
const User_1 = require("./../core/databases/postgres/entity/User");
const batchGetUsers = async (userId) => {
    const users = await User_1.User.findByIds(userId);
    return userId.map((id) => users.find((user) => user.id === id));
};
const batchGetVoteTypes = async (voteTypeConditions) => {
    const voteTypes = await Upvote_1.Upvote.findByIds(voteTypeConditions);
    return voteTypeConditions.map((objectId) => voteTypes.find((voteType) => voteType.postId == objectId.postId && voteType.userId == objectId.userId));
};
const buildDataLoaders = () => ({
    userLoader: new dataloader_1.default((userId) => batchGetUsers(userId)),
    voteTypeLoader: new dataloader_1.default((voteTypeConditions) => batchGetVoteTypes(voteTypeConditions)),
});
exports.buildDataLoaders = buildDataLoaders;
//# sourceMappingURL=dataLoaders.js.map