import { buildDataLoaders } from './../../../../utils/dataLoaders'
import { Connection } from 'typeorm'
import { TypeRequest, TypeResponse } from './../../../../request/types/request'
// import { SessionData, Session } from 'express-session'
// export type { Request, Response } from 'express'

export type Context = {
  req: TypeRequest
  res: TypeResponse
  connect: Connection
  dataLoaders: ReturnType<typeof buildDataLoaders>
}
