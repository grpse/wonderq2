import { DataObject } from './data-object'

export interface Queue<T = any> {
  isEmpty(): boolean
  size(): number
  delete(messageId: number): void
  push(data: T): number
  getNext(): DataObject
  getMax(max: number): DataObject[]
  getAll(): DataObject[]
}