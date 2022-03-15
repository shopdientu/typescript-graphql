import type {} from 'express'
export class BaseError extends Error {
  constructor(mess: string) {
    super(mess)
  }
}
