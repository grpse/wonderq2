import { MessagesQueue } from '@modules/messages-queue/messages.queue'
import { MessagesRestApiController } from '@modules/messages-queue/messages-rest-api.controller'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs';
import { Request, Response, NextFunction } from 'express';
const swaggerDocument = YAML.load('./api-docs.swagger.yaml');

const port = process.env.PORT || 3000
const messageTimeoutInMS = Number(process.env.MESSAGE_TIMEOUT || 1000)

console.log(`Message timeout ${messageTimeoutInMS} ms`)
const api = new MessagesRestApiController(new MessagesQueue({ timeoutMS: messageTimeoutInMS }))

api.server().use('/api-docs', function(req: Request, res: Response, next: NextFunction){
  swaggerDocument.host = req.get('host');
  // @ts-ignore
  req.swaggerDoc = swaggerDocument;
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

api.server().listen(port, () => {
  console.log(`Server started at port ${port}`)
})