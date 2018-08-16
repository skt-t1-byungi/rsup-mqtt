import test from 'ava'
import {start, stop} from './helpers/server'
import {connect, Client} from '../src'
import delay from 'delay'

const port = 9549
const ctx = {}
const createConnection = opts => connect({host: 'localhost', port, ...opts})
test.before(t => start(port, ctx))
test.after(stop)

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

  t.is(ctx.lastTopic, 'topic/test')
  t.is(ctx.lastPayload, 'hello~')
})
