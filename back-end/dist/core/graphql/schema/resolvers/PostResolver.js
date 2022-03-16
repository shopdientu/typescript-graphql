"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const Upvote_1 = require("./../../../databases/postgres/entity/Upvote");
const PaginatedPosts_1 = require("./../typeDefs/PaginatedPosts");
const checkAuth_1 = require("./../../../middleware/checkAuth");
const Post_1 = require("./../../../databases/postgres/entity/Post");
const type_graphql_1 = require("type-graphql");
const http_status_codes_1 = require("http-status-codes");
const PostMutationResponse_1 = require("../typeDefs/PostMutationResponse");
const CreatePostInput_1 = require("../typeDefs/CreatePostInput");
const UpdatePostInput_1 = require("../typeDefs/UpdatePostInput");
const typeorm_1 = require("typeorm");
const VoteType_1 = require("../typeDefs/VoteType");
const apollo_server_express_1 = require("apollo-server-express");
(0, type_graphql_1.registerEnumType)(VoteType_1.VoteType, {
    name: 'VoteType',
});
let PostResolver = class PostResolver {
    textSnipper(root) {
        return root.text.slice(0, 50);
    }
    async totalVote(root) {
        const totalVotes = (await Upvote_1.Upvote.find({ postId: root.id })).reduce((a, b) => a + b.value, 0);
        return totalVotes;
    }
    async user({ userId }, { dataLoaders: { userLoader } }) {
        return await userLoader.load(userId);
    }
    async voteType(root, { req: { session: { userId }, }, dataLoaders: { voteTypeLoader }, }) {
        if (!userId)
            return 0;
        const existingVote = await voteTypeLoader.load({ postId: root.id, userId: userId });
        return existingVote ? existingVote.value : 0;
    }
    async posts(limit, cursor) {
        const totalPostCount = await Post_1.Post.count();
        const findOption = {
            order: {
                createAt: 'DESC',
            },
            take: Math.min(10, limit),
        };
        let lastPost = [];
        if (cursor) {
            findOption.where = { createAt: (0, typeorm_1.LessThan)(cursor) };
            lastPost = await Post_1.Post.find({ order: { createAt: 'ASC' }, take: 1 });
        }
        const posts = await Post_1.Post.find(findOption);
        return {
            totalCount: totalPostCount,
            cursor: posts[posts.length - 1].createAt,
            hasMore: cursor
                ? posts[posts.length - 1].createAt.toString() !== lastPost[0].createAt.toString()
                : posts.length !== totalPostCount,
            paginatedPosts: posts,
        };
    }
    async post(id) {
        const post = await Post_1.Post.findOne({ id: parseInt(id) });
        return post;
    }
    async createPost({ text, title }, { req }) {
        try {
            const userId = req.session.userId;
            const newPost = Post_1.Post.create({ title, text, userId });
            await newPost.save();
            return {
                code: http_status_codes_1.StatusCodes.OK,
                message: 'Create post success fully',
                success: true,
                post: newPost,
            };
        }
        catch (error) {
            console.log(error);
            return {
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Server error',
                success: false,
            };
        }
    }
    async updatePost({ id, text, title }, { req }) {
        try {
            const exitingPost = await Post_1.Post.findOne(id);
            if (!exitingPost)
                return {
                    code: http_status_codes_1.StatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE,
                    message: `Notfound Post with id is ${id}`,
                    success: false,
                    errors: [{ field: 'id', message: `Notfound Post with id is ${id} ` }],
                };
            if (exitingPost.userId !== req.session.userId) {
                return {
                    code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                    message: `Notfound Post with id is ${id}`,
                    success: false,
                    errors: [{ field: 'id' }],
                };
            }
            exitingPost.title = title;
            exitingPost.text = text;
            await exitingPost.save();
            return {
                code: http_status_codes_1.StatusCodes.OK,
                message: 'Update post success fully',
                success: true,
                post: exitingPost,
            };
        }
        catch (error) {
            console.log(error);
            return {
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Server error',
                success: false,
            };
        }
    }
    async deletePost(id, { req }) {
        const exitingPost = await Post_1.Post.findOne(id);
        if (!exitingPost)
            return {
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'NotFound Post ID',
                success: false,
            };
        if (exitingPost.userId !== req.session.userId)
            return {
                code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                message: 'UNAUTHORIZED',
                success: false,
            };
        await Post_1.Post.delete(id);
        return {
            code: 200,
            message: 'success',
            success: true,
        };
    }
    async vote(postId, inputVoteValue, { connect, req: { session: { userId }, }, }) {
        return await connect.transaction(async (transactionEntityManager) => {
            let post = await transactionEntityManager.findOne(Post_1.Post, postId);
            if (!post)
                throw new apollo_server_express_1.UserInputError('Post Not Found');
            const existingVote = await transactionEntityManager.findOne(Upvote_1.Upvote, { postId, userId });
            if (existingVote && existingVote.value !== inputVoteValue) {
                await transactionEntityManager.save(Upvote_1.Upvote, Object.assign(Object.assign({}, existingVote), { value: inputVoteValue }));
                post = await transactionEntityManager.save(Post_1.Post, Object.assign(Object.assign({}, post), { points: post.points + inputVoteValue }));
            }
            if (!existingVote) {
                const newVote = transactionEntityManager.create(Upvote_1.Upvote, {
                    userId,
                    postId,
                    value: inputVoteValue,
                });
                await transactionEntityManager.save(newVote);
                post.points = post.points + inputVoteValue;
                post = await transactionEntityManager.save(post);
            }
            return {
                code: 200,
                message: 'success',
                success: true,
                post: post,
            };
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)((_return) => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", String)
], PostResolver.prototype, "textSnipper", null);
__decorate([
    (0, type_graphql_1.FieldResolver)((_return) => Number),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "totalVote", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_1.FieldResolver)((_return) => type_graphql_1.Int),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "voteType", null);
__decorate([
    (0, type_graphql_1.Query)((_return) => PaginatedPosts_1.PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)('limit')),
    __param(1, (0, type_graphql_1.Arg)('cursor', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)((_return) => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', (_type) => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => PostMutationResponse_1.PostMutationResponse),
    (0, type_graphql_1.UseMiddleware)(checkAuth_1.checkAuth),
    __param(0, (0, type_graphql_1.Arg)('createPostInput')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePostInput_1.CreatePostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => PostMutationResponse_1.PostMutationResponse),
    (0, type_graphql_1.UseMiddleware)(checkAuth_1.checkAuth),
    __param(0, (0, type_graphql_1.Arg)('updatePostInput')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdatePostInput_1.UpdatePostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => PostMutationResponse_1.PostMutationResponse),
    (0, type_graphql_1.UseMiddleware)(checkAuth_1.checkAuth),
    __param(0, (0, type_graphql_1.Arg)('id', (_type) => type_graphql_1.ID)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => PostMutationResponse_1.PostMutationResponse),
    (0, type_graphql_1.UseMiddleware)(checkAuth_1.checkAuth),
    __param(0, (0, type_graphql_1.Arg)('postId', (_type) => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('inputVoteValue', (_type) => VoteType_1.VoteType)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)((_of) => Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=PostResolver.js.map