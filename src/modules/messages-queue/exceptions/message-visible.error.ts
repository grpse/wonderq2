export class MessageVisibleError extends Error {
  constructor() {
    super('Message timeout and went back to the pool')
  }
}