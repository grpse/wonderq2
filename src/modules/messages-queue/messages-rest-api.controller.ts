import {
  NextFunction,
  Request,
  Response,
  Router
} from 'express'
import { Queue } from '@models/queue'
import { RestApiController } from '@modules/rest-api.controller'

export class MessagesRestApiController extends RestApiController {
  private router = Router()

  constructor(private queue: Queue) {
    super()
  }

  public server() {
    super.server().use(this.routes())
    return super.server()
  }

  private routes() {
    this.router.post(
      '/',
      (req, res, next) => this.enqueue(req, res, next)
    )

    this.router.get(
      '/next',
      (req, res, next) => this.dequeue(req, res, next)
    )

    this.router.get(
      '/size',
      (req, res, next) => this.size(req, res, next)
    )

    this.router.get(
      '/some/:amount',
      (req, res, next) => this.getSome(req, res, next)
    )

    this.router.get(
      '/all',
      (req, res, next) => this.getAll(req, res, next)
    )

    this.router.delete(
      '/:id',
      (req, res, next) => this.delete(req, res, next)
    )

    return this.router
  }

  private enqueue(req: Request, res: Response, next: NextFunction) {
    res.status(201).json({ id: this.queue.push(req.body) })
  }

  private dequeue(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(this.queue.getNext())
    } catch (error) {
      res.status(204).end()
    }
  }

  private size(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({ size: this.queue.size() })
  }

  private getSome(req: Request, res: Response, next: NextFunction) {
    try {
      const someMessages = this.queue.getMax(parseInt(req.params.amount))
      res.status(200).json(someMessages)
    } catch (error) {
      res.status(204).end()
    }
  }

  private getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(this.queue.getAll())
    } catch (error) {
      res.status(204).end()
    }
  }

  private delete(req: Request, res: Response, next: NextFunction) {
    try {
      this.queue.delete(parseInt(req.params.id))
      res.status(200).end()
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }
}