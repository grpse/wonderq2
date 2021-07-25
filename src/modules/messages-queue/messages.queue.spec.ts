import { MessagesQueue } from '@modules/messages-queue/messages.queue'
import { EmptyQueueError } from '@modules/messages-queue/exceptions/empty-queue.error'
import { MessageVisibleError } from '@modules/messages-queue/exceptions/message-visible.error'

describe('MessagesQueue', () => {

  let timedQueue: MessagesQueue<number>

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(0)
    timedQueue = new MessagesQueue<number>()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should have empty queue', () => {
    expect(timedQueue.isEmpty()).toBeTruthy()
  })

  it('should enqueue a message', () => {
    const message = 1

    timedQueue.push(message)

    expect(timedQueue.isEmpty()).toBeFalsy()
  })

  it('should dequeue message', () => {
    const message = 1
    timedQueue.push(message)

    const previous = timedQueue.getNext()

    expect(previous.data).toEqual(message)
  })

  it('should return a message id when is enqueued', () => {
    const message = 1

    const id = timedQueue.push(message)

    expect(id).not.toBeUndefined()
    expect(timedQueue.isEmpty()).toBeFalsy()
  })

  it('should return the same id for the enqueued message', () => {
    const message = 1
    const id = timedQueue.push(message)

    const previousMessage = timedQueue.getNext()

    expect(previousMessage.id).toEqual(id)
    expect(timedQueue.isEmpty()).toBeTruthy()
  })

  it('should keep the order of the messages', () => {
    const message1 = 1
    const message2 = 2
    const message3 = 3
    timedQueue.push(message1)
    timedQueue.push(message2)
    timedQueue.push(message3)

    const dequeuedMessage1 = timedQueue.getNext()
    const dequeuedMessage2 = timedQueue.getNext()
    const dequeuedMessage3 = timedQueue.getNext()

    expect(dequeuedMessage1.data).toEqual(message1)
    expect(dequeuedMessage2.data).toEqual(message2)
    expect(dequeuedMessage3.data).toEqual(message3)
    expect(timedQueue.isEmpty()).toBeTruthy()
  })

  it('should get messages in order', () => {
    const message1 = 1
    const message2 = 2
    const message3 = 3
    timedQueue.push(message1)
    timedQueue.push(message2)
    timedQueue.push(message3)

    const [
      dequeuedMessage1,
      dequeuedMessage2,
      dequeuedMessage3,
    ] = timedQueue.getMax(3)

    expect(dequeuedMessage1.data).toEqual(message1)
    expect(dequeuedMessage2.data).toEqual(message2)
    expect(dequeuedMessage3.data).toEqual(message3)
    expect(timedQueue.isEmpty()).toBeTruthy()
  })

  it('should return message to the pool after timeout', () => {
    const message = 1
    timedQueue.push(message)
    const dequeuedMessage = timedQueue.getNext()

    expect(timedQueue.isEmpty()).toBeTruthy()
    expect(() => timedQueue.getNext()).toThrowError(EmptyQueueError)

    jest.advanceTimersByTime(1001)

    const dequeuedAgain = timedQueue.getNext()
    expect(dequeuedAgain.id).toEqual(dequeuedMessage.id)
    expect(timedQueue.isEmpty()).toBeTruthy()
  })

  it('should return messages to the pool after timeout', () => {
    const message1 = 1
    const message2 = 2
    const message3 = 3
    timedQueue.push(message1)
    timedQueue.push(message2)
    timedQueue.push(message3)

    const [
      dequeuedMessage1,
      dequeuedMessage2,
      dequeuedMessage3,
    ] = timedQueue.getMax(3)

    expect(() => timedQueue.getMax(3)).toThrowError(EmptyQueueError)

    jest.advanceTimersByTime(1001)

    const [
      dequeuedMessage1Again,
      dequeuedMessage2Again,
      dequeuedMessage3Again,
    ] = timedQueue.getMax(3)

    expect(dequeuedMessage1.data).toEqual(dequeuedMessage1Again.data)
    expect(dequeuedMessage2.data).toEqual(dequeuedMessage2Again.data)
    expect(dequeuedMessage3.data).toEqual(dequeuedMessage3Again.data)
    expect(timedQueue.isEmpty()).toBeTruthy()
  })

  it('should throw error when not enough elements requested to poll', () => {
    const message = 1

    timedQueue.push(message)

    expect(timedQueue.getMax(3).length).toBe(1)
    expect(timedQueue.isEmpty()).toBeTruthy()
  })

  it('should mark processed and remove from the queue', () => {
    const message = 1
    timedQueue.push(message)
    const dequeuedMessage = timedQueue.getNext()

    timedQueue.delete(dequeuedMessage.id)

    expect(timedQueue.size()).toBe(0)
  })

  it('should not mark as processed after timeout', () => {
    const message = 1
    timedQueue.push(message)
    const dequeuedMessage = timedQueue.getNext()

    jest.advanceTimersByTime(1001)

    expect(() => timedQueue.delete(dequeuedMessage.id))
      .toThrowError(MessageVisibleError)

    expect(timedQueue.size()).toBe(1)
  })

  it('should get all the messages', () => {
    const message1 = 1
    const message2 = 2
    const message3 = 3
    timedQueue.push(message1)
    timedQueue.push(message2)
    timedQueue.push(message3)

    const [
      dequeuedMessage1,
      dequeuedMessage2,
      dequeuedMessage3,
    ] = timedQueue.getAll()

    expect(timedQueue.size()).toBe(3)
    expect(dequeuedMessage1.data).toEqual(message1)
    expect(dequeuedMessage2.data).toEqual(message2)
    expect(dequeuedMessage3.data).toEqual(message3)
    expect(timedQueue.isEmpty()).toBeTruthy()
  })
})
