import { Context } from './../graphql/schema/typeDefs/Context'
import { MiddlewareFn } from 'type-graphql'
import { AuthenticationError } from 'apollo-server-express'

export const checkAuth: MiddlewareFn<Context> = ({ context: { req } }, next) => {
  console.log(req.session.userId)
  if (!req.session.userId)
    throw new AuthenticationError('Not Authentication to perform Graphql operations')
  return next()
}
