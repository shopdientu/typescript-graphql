import { TokenModel } from './../../../../models/Token'
import { sendMail } from './../../../../utils/sendMail'
import { registerValidate } from './../../validator/RegisterValidator'
import { RegisterInput } from './../typeDefs/RegisterInput'
import { AppError } from './../../../Error/index'
import { User } from './../../../databases/postgres/entity/User'
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql'
import argon2 from 'argon2'
import { StatusCodes } from 'http-status-codes'
import { UserMutationResponse } from '../typeDefs/UserMutationResponse'
import { LoginInput } from '../typeDefs/LoginInput'
import { Context } from '../typeDefs/Context'
import { ForgotPasswordInput } from '../typeDefs/ForgotPasswordInput'
import { v4 as uuidv4 } from 'uuid'
import { ChangePasswordInput } from '../typeDefs/ChangePasswordInput'

@Resolver((_of) => User)
export class UserResolver {
  @FieldResolver((_return) => String)
  email(@Root() root: User, @Ctx() { req }: Context): string {
    return req.session.userId === root.id ? root.email : ''
  }

  @Query((_return) => User, { nullable: true })
  async me(@Ctx() { req }: Context): Promise<User | undefined | null> {
    if (!req.session.userId) return null
    const user = await User.findOne(req.session.userId)
    return user
  }

  @Mutation((_returns) => UserMutationResponse)
  async register(
    @Arg('registerInput') { email, username, password }: RegisterInput
  ): Promise<UserMutationResponse> {
    try {
      const validateInput = registerValidate({ email, username, password })
      if (validateInput !== null)
        return {
          code: StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE,
          message: 'Input not duplicated',
          success: false,
          errors: [{ ...validateInput }],
        }
      const existingUser = await User.findOne({ where: [{ username }, { email }] })
      if (existingUser)
        return {
          code: StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE,
          message: 'username or email already taken',
          success: false,
          errors: [
            {
              field: existingUser.email === email ? 'email' : 'username',
              message: 'username or email already taken',
            },
          ],
        }
      const hashPassword = await argon2.hash(password).catch(() => {
        throw new AppError('error hash-pass server', StatusCodes.EXPECTATION_FAILED)
      })
      const newUser = User.create({
        username,
        password: hashPassword,
        email,
      })

      await newUser.save().catch(() => {
        throw new AppError('Not Save UserRegister in DB', StatusCodes.BAD_GATEWAY)
      })
      return {
        code: StatusCodes.OK,
        message: 'register success Fully',
        success: true,
        user: newUser,
      }
    } catch (error) {
      console.log('error')
      return {
        code: StatusCodes.BAD_GATEWAY,
        message: 'Error Server',
        success: false,
      }
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg('loginInput') { usernameOrEmail, password }: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const exitingUser = await User.findOne(
        usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail }
      ).catch(() => {
        throw new AppError("Can't get user email in database error ", StatusCodes.BAD_REQUEST)
      })

      if (!exitingUser)
        return {
          code: StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE,
          success: false,
          message: 'usernameOrEmail duplicated',
          errors: [
            {
              message: 'usernameOrEmail in correct',
              field: 'usernameOrEmail',
            },
          ],
        }

      if (await argon2.verify(exitingUser.password, password)) {
        req.session.userId = exitingUser.id
        console.log(req.session.userId)
        return {
          code: StatusCodes.OK,
          message: 'Login success',
          success: true,
          user: exitingUser,
        }
      } else {
        return {
          code: StatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE,
          message: 'password in correct',
          success: false,
          errors: [
            {
              field: 'password',
              message: 'password in correct',
            },
          ],
        }
      }
    } catch (error) {
      console.log(error)
      return {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Server error',
        success: false,
      }
    }
  }

  @Mutation((_return) => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve, _rejects) => {
      res.clearCookie(process.env.COOKIE_NAME as string)
      req.session.destroy((error) => {
        console.log(error)
        resolve(false)
      })
      resolve(true)
    })
  }

  @Mutation((_return) => Boolean)
  async forgotPassword(
    @Arg('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput
  ): Promise<boolean> {
    const existingUser = await User.findOne({
      email: forgotPasswordInput.email,
    })
    if (!existingUser) return false

    await TokenModel.findOneAndDelete({ userId: `${existingUser.id}` })

    const resetToken = uuidv4()
    const hashToken = await argon2.hash(resetToken)

    await new TokenModel({
      userId: `${existingUser.id}`,
      token: hashToken,
    }).save()

    await sendMail(
      forgotPasswordInput.email,
      `
      Click forgotPassword <a href="http://localhost:3000/change-password?token=${resetToken}&userId=${existingUser.id}">Click forgotPassword</a>
      `
    )
    return true
  }

  @Mutation((_return) => UserMutationResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('userId') userId: string,
    @Arg('changePasswordInput') changePasswordInput: ChangePasswordInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
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
      }
    }

    try {
      const resetPassword = await TokenModel.findOne({ userId })
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
        }
      }

      const resetPasswordToken = await argon2.verify(resetPassword.token, token)
      console.log(resetPasswordToken, token)
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
        }
      const userIdNum = parseInt(userId)
      const existingUser = await User.findOne(userIdNum)
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
        }
      const updatePassword = await argon2.hash(changePasswordInput.newPassword)
      await User.update({ id: userIdNum }, { password: updatePassword })
      await resetPassword.deleteOne()
      req.session.userId = userIdNum
      return {
        code: 200,
        message: 'change password success fully',
        success: true,
        user: existingUser,
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500,
        success: false,
        message: 'interval server error',
      }
    }
  }
}
