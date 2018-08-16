import test from 'ava'
import {connect, Client} from '../src'
import delay from 'delay'
import {createConnection} from './_before'

test.cb('connect fail', t => {
  connect({host: 'localhost', port: 1}).catch(() => t.end())
})

test('connect success', async t => {
  const client = await createConnection()
  t.true(client instanceof Client)
})

test('publish message', async t => {
  const client = await createConnection()

  client.publish('topic/test', 'hello~')

  await delay(10)

  // t.is(ctx.lastTopic, 'topic/test')
  // t.is(ctx.lastPayload, 'hello~')
})

// test('subscribe topic', async t => {
//   const client1 = await createConnection()
//   const client2 = await createConnection()

//   client.publish('topic/test', 'hello~')

//   await delay(10)

//   t.is(ctx.lastTopic, 'topic/test')
//   t.is(ctx.lastPayload, 'hello~')
// })
