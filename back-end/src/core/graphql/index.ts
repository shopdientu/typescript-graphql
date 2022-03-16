import { __prop__ } from './../constants'
import { buildDataLoaders } from './../../utils/dataLoaders'
import { Context } from './schema/typeDefs/Context'
import { PostResolver } from './schema/resolvers/PostResolver'
import { UserResolver } from './schema/resolvers/UserResolver'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-express'
import type { Express } from 'express'
import { buildSchema } from 'type-graphql'
// import {buildSchema, BuildSchemaOptions} from'graphql'

import { TestResolver } from './schema/resolvers/TestResolve'
import { AppError } from '../Error'
import { StatusCodes } from 'http-status-codes'
import { Connection } from 'typeorm'

export const connectApolloServer = async (app: Express, connect: Promise<Connection>) => {
  const connPostgres = await connect
  if (__prop__) await connPostgres.runMigrations()
  console.log('starting ApolloServer ... ')
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [TestResolver, UserResolver, PostResolver],
      validate: false,
    }).catch((e) => {
      console.log(e)
      throw new AppError('Error Graphql Server fail build Schema', StatusCodes.BAD_GATEWAY)
    }),
    context: ({ res, req }): Context => ({
      res,
      req,
      connect: connPostgres,
      dataLoaders: buildDataLoaders(),
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  })
  // console.log(app)
  await apolloServer.start().catch(() => {
    throw new AppError('Error Graphql Server', StatusCodes.BAD_GATEWAY)
  })
  apolloServer.applyMiddleware({ app, cors: false })

  console.log(`connected Apollo-server ${apolloServer.graphqlPath}`)
}
