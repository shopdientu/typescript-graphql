import { __prop__ } from './constants'
// import { sendMail } from './../utils/sendMail'
// import { Context } from './graphql/schema/typeDefs/Context';
import { RequestApp } from './../request/index'
import { connectApolloServer } from './graphql/index'
import { connectMongo } from './databases/mongo/index'
import type { Express, RequestHandler } from 'express'
import { connectPostgres } from './databases/postgres/index'
import { sessionMongoApp } from './sessions'
import cors from 'cors'

export default class App {
  public reqApp: RequestApp
  public resApp: Response
  public errApp: Error
  public callback: () => {}

  constructor(public app: Express) {}

  useApp(callback: RequestHandler) {
    return this.app.use(callback)
  }

  startServerOnPort() {
    this.app.use(sessionMongoApp())
    console.log('Started Session')
    const port = process.env.PORT || 5000
    this.app.listen(port, () => {
      console.log(`Server started on port ${port}`)
    })
  }

  async run() {
    this.startServerOnPort()
    this.app.use(
      cors({
        origin: __prop__ ? process.env.CORS_PRO : process.env.CORS_DEV,
        credentials: true,
      })
    )

    return await Promise.all([connectMongo(), connectApolloServer(this.app, connectPostgres())])
  }

  public() {
    return {}
  }
}
