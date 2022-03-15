import { StatusCodes } from 'http-status-codes'
import { BaseError } from './BaseError'

export class ConnectError extends BaseError {
  message: string

  constructor(public msg: string, public statusCode: StatusCodes) {
    super(msg)
  }
}
