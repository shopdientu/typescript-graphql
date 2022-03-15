import { Upvote } from './entity/Upvote'
import { AppError } from './../../Error/index'
import { Connection, createConnection } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { User } from './entity/User'
import { Post } from './entity/Post'

export const connectPostgres = async (): Promise<Connection> => {
  console.log('connect PostGres')
  return await createConnection({
    type: 'postgres',
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    logging: true,
    synchronize: true,
    entities: [User, Post, Upvote],
  }).catch(() => {
    throw new AppError('Error connect postgres', StatusCodes.BAD_GATEWAY)
  })
}
