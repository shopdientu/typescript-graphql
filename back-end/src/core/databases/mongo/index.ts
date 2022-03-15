import { AppError } from './../../Error/index'
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'

export const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI as string).catch(() => {
    throw new AppError('error connect Postgres', StatusCodes.BAD_GATEWAY)
  })
  console.log('Connected Mongo')
}
