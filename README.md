## WonderQ 2

#### An in memory message queue (FIFO) with configurable timeout.

**Setup**
```
npm install
```

**Starting the server**

```
npm start
```
or with configurated port and message timeout
```
MESSAGE_TIMEOUT=<timeout time in miliseconds> \
PORT=<port number> \
npm start
```

**Running the tests**
```
npm test
```
or with test coverage
```
npm run test:cov
```

**Display api documentation (Swagger 2.0)**

- Start the server
- visit (host default is localhost:3000)/api-docs

## /How to scale/

**Steps to scale**

The data structure (key-value), where the key is the id of the message and the value is the message content as current implementation allows the queue to use the key-value store to perform fast append with ordered data sets while inserting.

In this matter would be preferred to use MongoDB. Each new insert into the queue will be appended to a single collection. Each read will use the inserted order to behave as FIFO. Since each message receives an ObjectID in insertion that will keep a natural ordering based on this key/id structure.

The enqueue action will be an insertion on collection "messages" with 2 keys, one for the locked
timestamp `lockedTimeout` (on creation the value is initialized with 0), `body` that will hold the message content and, the `_id` is the ObjectID automatically defined. When retrieving any message from the queue, would perform an upsert to update the `lockedTimestamp` point in a future time where the message can be handled back to the pool of available messages (this point in time needs to be in milliseconds and defined by the `$currentDate` + `MESSAGES_TIMEOUT`).

To retrieve messages from the pool and update its `lockedTimeout` field would be needed to use the operation `findAndModify` to one operation with O(n) instead of finding and only then updating the objects.

**Potentials issues**

The availability of the system could be a problem in production. To solve this issue need to use replica sets that copy the same data from the master node initially defined. In case one falls down, then the mechanism of the election of the set will select one of the replicas and use it as a master node.

Horizontally scaling would be achieved via sharding through mongo router with partition key as the object id (Hashes keys). This can distribute the reads and increase the possibility of distributing the inserts across partitions.

