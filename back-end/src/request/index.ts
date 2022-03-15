import { TypeRequest, Token } from './types/request'
import type { Request } from 'express'

export class RequestApp {
  public token: Token
  public public: TypeRequest
  public url: Partial<TypeRequest>

  constructor(request: Request) {
    this.token = request.session
  }
}
