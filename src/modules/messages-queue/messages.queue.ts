import { EmptyQueueError } from './exceptions/empty-queue.error'
import { MessageVisibleError } from './exceptions/message-visible.error'
import { DataObject } from '@models/data-object'
import { Queue } from '@models/queue'

type MessageLockTimeoutData = {
  lockedTimeout: number
  data: any
}

export class MessagesQueue<T extends any> implements Queue<T> {
  private static defaultConfig = { timeoutMS: 1000 }
  private messagesMap = new Map<number, MessageLockTimeoutData>()
  private nextId = 1
  constructor(private config = MessagesQueue.defaultConfig) { }

  isEmpty(): boolean {
    return this.getNotLockedMessages().length === 0
  }

  size(): number {
    return this.messagesMap.size
  }

  delete(messageId: number) {
    const message = this.messagesMap.get(messageId)
    if (!message || !this.isMessageLockedNow(message))
      throw new MessageVisibleError()
    this.messagesMap.delete(messageId)
  }

  push(data: T): number {
    const id = this.nextId++
    this.messagesMap.set(id, { lockedTimeout: 0, data })
    return id
  }

  getNext(): DataObject {
    return this.pollsNotLockedMessages(1)[0]
  }

  getMax(max: number): DataObject[] {
    return this.pollsNotLockedMessages(max)
  }

  getAll() {
    return this.pollsNotLockedMessages(this.size())
  }

  private pollsNotLockedMessages(max: number): DataObject[] {
    if (this.isEmpty()) throw new EmptyQueueError()
    return this.getMaxAmountMessagesWhileLockingThem(max);
  }

  private getMaxAmountMessagesWhileLockingThem(max: number): DataObject[] {
    const freeTimeout = this.getNextTimeoutTime();
    return this.getNotLockedMessages()
      .slice(0, max)
      .map(([id, message]) => {
        message.lockedTimeout = freeTimeout
        return { id, data: message.data }
      })
  }

  private getNextTimeoutTime(now = Date.now()) {
    return now + this.config.timeoutMS
  }

  private getNotLockedMessages(): [number, MessageLockTimeoutData][] {
    return Array
      .from(this.messagesMap)
      .filter(([id, message]) => !this.isMessageLockedNow(message))
  }

  private isMessageLockedNow(message: MessageLockTimeoutData): boolean {
    return Date.now() < message.lockedTimeout
  }
}
