import { Session, SessionData } from 'express-session'
import type { Request, Response } from 'express'

declare module 'express-session' {
  interface SessionData {
    userId: number
  }
}

type ReqKeys = 'url' | 'params' | 'ip' | 'body' | 'query' | 'session'
type ResKeys = 'clearCookie' | 'send' | 'json'
export type Token = Session & Partial<SessionData>

export type TypeRequest = Pick<Request, ReqKeys>
export type TypeResponse = Pick<Response, ResKeys>
