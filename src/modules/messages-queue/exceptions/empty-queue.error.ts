export class EmptyQueueError extends Error {
  constructor() {
    super('Empty queue')
  }
}