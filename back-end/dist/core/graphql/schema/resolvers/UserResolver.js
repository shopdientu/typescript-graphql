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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const Token_1 = require("./../../../../models/Token");
const sendMail_1 = require("./../../../../utils/sendMail");
const RegisterValidator_1 = require("./../../validator/RegisterValidator");
const RegisterInput_1 = require("./../typeDefs/RegisterInput");
const index_1 = require("./../../../Error/index");
const User_1 = require("./../../../databases/postgres/entity/User");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const http_status_codes_1 = require("http-status-codes");
const UserMutationResponse_1 = require("../typeDefs/UserMutationResponse");
const LoginInput_1 = require("../typeDefs/LoginInput");
const ForgotPasswordInput_1 = require("../typeDefs/ForgotPasswordInput");
const uuid_1 = require("uuid");
const ChangePasswordInput_1 = require("../typeDefs/ChangePasswordInput");
let UserResolver = class UserResolver {
    email(root, { req }) {
        return req.session.userId === root.id ? root.email : '';
    }
    async me({ req }) {
        if (!req.session.userId)
            return null;
        const user = await User_1.User.findOne(req.session.userId);
        return user;
    }
    async register({ email, username, password }) {
        try {
            const validateInput = (0, RegisterValidator_1.registerValidate)({ email, username, password });
            if (validateInput !== null)
                return {
                    code: http_status_codes_1.StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE,
                    message: 'Input not duplicated',
                    success: false,
                    errors: [Object.assign({}, validateInput)],
                };
            const existingUser = await User_1.User.findOne({ where: [{ username }, { email }] });
            if (existingUser)
                return {
                    code: http_status_codes_1.StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE,
                    message: 'username or email already taken',
                    success: false,
                    errors: [
                        {
                            field: existingUser.email === email ? 'email' : 'username',
                            message: 'username or email already taken',
                        },
                    ],
                };
            const hashPassword = await argon2_1.default.hash(password).catch(() => {
                throw new index_1.AppError('error hash-pass server', http_status_codes_1.StatusCodes.EXPECTATION_FAILED);
            });
            const newUser = User_1.User.create({
                username,
                password: hashPassword,
                email,
            });
            await newUser.save().catch(() => {
                throw new index_1.AppError('Not Save UserRegister in DB', http_status_codes_1.StatusCodes.BAD_GATEWAY);
            });
            return {
                code: http_status_codes_1.StatusCodes.OK,
                message: 'register success Fully',
                success: true,
                user: newUser,
            };
        }
        catch (error) {
            console.log('error');
            return {
                code: http_status_codes_1.StatusCodes.BAD_GATEWAY,
                message: 'Error Server',
                success: false,
            };
        }
    }
    async login({ usernameOrEmail, password }, { req }) {
        try {
            const exitingUser = await User_1.User.findOne(usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail }).catch(() => {
                throw new index_1.AppError("Can't get user email in database error ", http_status_codes_1.StatusCodes.BAD_REQUEST);
            });
            if (!exitingUser)
                return {
                    code: http_status_codes_1.StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE,
                    success: false,
                    message: 'usernameOrEmail duplicated',
                    errors: [
                        {
                            message: 'usernameOrEmail in correct',
                            field: 'usernameOrEmail',
                        },
                    ],
                };
            if (await argon2_1.default.verify(exitingUser.password, password)) {
                req.session.userId = exitingUser.id;
                console.log(req.session.userId);
                return {
                    code: http_status_codes_1.StatusCodes.OK,
                    message: 'Login success',
                    success: true,
                    user: exitingUser,
                };
            }
            else {
                return {
                    code: http_status_codes_1.StatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE,
                    message: 'password in correct',
                    success: false,
                    errors: [
                        {
                            field: 'password',
                            message: 'password in correct',
                        },
                    ],
                };
            }
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
    logout({ req, res }) {
        return new Promise((resolve, _rejects) => {
            res.clearCookie(process.env.COOKIE_NAME);
            req.session.destroy((error) => {
                console.log(error);
                resolve(false);
            });
            resolve(true);
        });
    }
    async forgotPassword(forgotPasswordInput) {
        const existingUser = await User_1.User.findOne({
            email: forgotPasswordInput.email,
        });
        if (!existingUser)
            return false;
        await Token_1.TokenModel.findOneAndDelete({ userId: `${existingUser.id}` });
        const resetToken = (0, uuid_1.v4)();
        const hashToken = await argon2_1.default.hash(resetToken);
        await new Token_1.TokenModel({
            userId: `${existingUser.id}`,
            token: hashToken,
        }).save();
        await (0, sendMail_1.sendMail)(forgotPasswordInput.email, `
      Click forgotPassword <a href="http://localhost:3000/change-password?token=${resetToken}&userId=${existingUser.id}">Click forgotPassword</a>
      `);
        return true;
    }
    async changePassword(token, userId, changePasswordInput, { req }) {
        if (changePasswordInput.newPassword.length < 4) {
            return {
                code: 400,
                success: false,
                message: 'invalid password',
                errors: [
                    {
                        field: 'newPassword',
                        message: 'Password must be greater than 3',
                    },
                ],
            };
        }
        try {
            const resetPassword = await Token_1.TokenModel.findOne({ userId });
            if (!resetPassword) {
                return {
                    code: 400,
                    success: false,
                    message: 'invalid or expired password reset token',
                    errors: [
                        {
                            field: 'token',
                            message: 'invalid or expire password reset token',
                        },
                    ],
                };
            }
            const resetPasswordToken = await argon2_1.default.verify(resetPassword.token, token);
            console.log(resetPasswordToken, token);
            if (!resetPasswordToken)
                return {
                    code: 400,
                    success: false,
                    message: 'invalid password',
                    errors: [
                        {
                            field: 'token',
                            message: 'Invalid or expire password reset token',
                        },
                    ],
                };
            const userIdNum = parseInt(userId);
            const existingUser = await User_1.User.findOne(userIdNum);
            if (!existingUser)
                return {
                    code: 400,
                    success: false,
                    message: 'invalid user',
                    errors: [
                        {
                            field: 'user',
                            message: 'user no longer exists',
                        },
                    ],
                };
            const updatePassword = await argon2_1.default.hash(changePasswordInput.newPassword);
            await User_1.User.update({ id: userIdNum }, { password: updatePassword });
            await resetPassword.deleteOne();
            req.session.userId = userIdNum;
            return {
                code: 200,
                message: 'change password success fully',
                success: true,
                user: existingUser,
            };
        }
        catch (error) {
            console.log(error);
            return {
                code: 500,
                success: false,
                message: 'interval server error',
            };
        }
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)((_return) => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", String)
], UserResolver.prototype, "email", null);
__decorate([
    (0, type_graphql_1.Query)((_return) => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)((_returns) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('registerInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('loginInput')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginInput_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => Boolean),
    __param(0, (0, type_graphql_1.Arg)('forgotPasswordInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotPasswordInput_1.ForgotPasswordInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('token')),
    __param(1, (0, type_graphql_1.Arg)('userId')),
    __param(2, (0, type_graphql_1.Arg)('changePasswordInput')),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ChangePasswordInput_1.ChangePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)((_of) => User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=UserResolver.js.map