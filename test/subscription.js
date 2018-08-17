import test from 'ava'
import delay from 'delay'
import {createConnection} from './_before'

test('publish, onMessage', async t => {
  const [receiver, sender] = await Promise.all([createConnection(), createConnection()])
  const subscription = receiver.subscribe('topic/test1')

  t.plan(1)
  subscription.on(m => t.is(m.string, 'hello'))
  sender.publish('topic/test1', 'hello')

  await delay(300)
})
