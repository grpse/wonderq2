const request = require('supertest')
import { MessagesRestApiController } from '@modules/messages-queue/messages-rest-api.controller'
import { MessagesQueue } from '@modules/messages-queue/messages.queue'

describe('MessagesController', () => {

  let controller: MessagesRestApiController

  beforeEach(() => {
    controller = new MessagesRestApiController(new MessagesQueue({ timeoutMS: 1000 }))
  })

  it('should produce a message', async () => {
    const message = { content: '1' }

    const response = await request(controller.server())
      .post('/')
      .send(message)

    expect(response.status).toBe(201)
    expect(response.body.id).not.toBeUndefined()
  })

  it('should retrieve one message', async () => {
    const message = { content: '1' }
    const server = controller.server()
    const enqueueResponse = await request(server)
      .post('/')
      .send(message)

    const dequeueResponse = await request(server)
      .get('/next')

    expect(dequeueResponse.status).toBe(200)
    expect(dequeueResponse.body.data).toStrictEqual(message)
    expect(dequeueResponse.body.id).toBe(enqueueResponse.body.id)
  })

  it('should retrieve one message when queue is empty', async () => {
    const server = controller.server()

    const dequeueResponse = await request(server)
      .get('/next')

    expect(dequeueResponse.status).toBe(204)
  })

  it('should have no stored messages', async () => {
    const server = controller.server()

    const sizeResponse = await request(server).get('/size')

    expect(sizeResponse.status).toBe(200)
    expect(sizeResponse.body.size).toBe(0)
  })

  it('should have size of 1 for stored messages', async () => {
    const server = controller.server()
    const message = { content: '1' }
    await request(server).post('/').send(message)

    const sizeResponse = await request(server).get('/size')

    expect(sizeResponse.status).toBe(200)
    expect(sizeResponse.body.size).toBe(1)
  })

  it('should get all available messages', async() => {
    const server = controller.server()
    const message1Id = await request(server).post('/').send({ content: '1' })
    const message2Id = await request(server).post('/').send({ content: '2' })

    const messages = await request(server).get('/all')

    expect(messages.body.length).toBe(2)
    expect(messages.body).toStrictEqual([
      { id: message1Id.body.id, data: { content: '1' } },
      { id: message2Id.body.id, data: { content: '2' } },
    ])
  })

  it('should retrieve all messages when queue is empty', async () => {
    const server = controller.server()

    const dequeueResponse = await request(server)
      .get('/all')

    expect(dequeueResponse.status).toBe(204)
  })

  it('should get some of available messages', async() => {
    const server = controller.server()
    const message1Id = await request(server).post('/').send({ content: '1' })
    const message2Id = await request(server).post('/').send({ content: '2' })

    const messages = await request(server).get('/some/1')

    expect(messages.body).toHaveLength(1)
    expect(messages.body).toStrictEqual([
      { id: message1Id.body.id, data: { content: '1' } },
    ])
  })

  it('should retrieve some messages when queue is empty', async () => {
    const server = controller.server()

    const dequeueResponse = await request(server)
      .get('/some/1')

    expect(dequeueResponse.status).toBe(204)
  })

  it('should retrieve one message and delete it', async () => {
    const message = { content: '1' }
    const server = controller.server()
    const enqueueResponse = await request(server)
      .post('/')
      .send(message)

    const dequeueResponse = await request(server).get('/next')

    const deleteResponse = await request(server).delete(`/${dequeueResponse.body.id}`)

    const sizeResponse = await request(server).get('/size')

    expect(deleteResponse.status).toBe(200)
    expect(sizeResponse.status).toBe(200)
    expect(sizeResponse.body.size).toBe(0)
  })

  it('should retrive a message and not delete it because it is timeouted', async () => {
    jest.useFakeTimers().setSystemTime(0)
    const message = { content: '1' }
    const server = controller.server()
    const enqueueResponse = await request(server)
      .post('/')
      .send(message)

    const dequeueResponse = await request(server).get('/next')

    jest.advanceTimersByTime(1000)

    const deleteResponse = await request(server)
      .delete(`/${dequeueResponse.body.id}`)

    const sizeResponse = await request(server).get('/size')

    expect(deleteResponse.status).toBe(400)
    expect(deleteResponse.body).toStrictEqual({
      message: 'Message timeout and went back to the pool'
    })
    expect(sizeResponse.status).toBe(200)
    expect(sizeResponse.body.size).toBe(1)
  })
})