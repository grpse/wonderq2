import express, { Express, NextFunction, Request, Response } from 'express'
import cors from 'cors'

export class RestApiController {
  private app: Express

  constructor() {
    this.app = express()
    this.applyMiddlewares()
  }

  public server() {
    return this.app
  }

  private applyMiddlewares() {
    this.app.use(express.json())
    this.app.use(cors())
  }
}