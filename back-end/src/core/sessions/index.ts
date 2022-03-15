import MongoStore from 'connect-mongo'
import session from 'express-session'
import { isProduction } from '../constants'

export const sessionMongoApp = () => {
  console.log('session created')
  return session({
    name: process.env.COOKIE_NAME as string,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_SESSION as string,
    }),
    cookie: {
      maxAge: 60 * 60 * 1000 * 24,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    },
    secret: process.env.MONGO_SESSION as string,
    saveUninitialized: false,
    resave: false,
  })
}
