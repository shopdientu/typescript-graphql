import { __prop__ } from './../../constants'
import { Upvote } from './entity/Upvote'
import { AppError } from './../../Error/index'
import { Connection, createConnection } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { User } from './entity/User'
import { Post } from './entity/Post'
import path from 'path'

export const connectPostgres = async (): Promise<Connection> => {
  console.log('connect PostGres')
  console.log(path.join(__dirname, '/migrations/*'))
  return await createConnection({
    type: 'postgres',
    ...(__prop__
      ? { url: process.env.DATABASE_URL }
      : {
          database: process.env.POSTGRES_DATABASE,
          username: process.env.POSTGRES_USERNAME,
          password: process.env.POSTGRES_PASSWORD,
        }),

    logging: true,
    ...(__prop__ ? {} : { synchronize: true }),
    ...(__prop__
      ? {
          extra: { ssl: { rejectUnauthorized: false } },
          ssl: true,
        }
      : {}),
    entities: [User, Post, Upvote],
    migrations: [path.join(__dirname, '/migrations/*')],
  }).catch(() => {
    throw new AppError('Error connect postgres', StatusCodes.BAD_GATEWAY)
  })
}
