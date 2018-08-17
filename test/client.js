import test from 'ava'
import delay from 'delay'
import {createConnection} from './_before'

test('publish', async t => {
  const client = await createConnection()
  client.publish('topic/test1', 'hello~')

  await delay(10)

  t.is(client.getCtx('topic'), 'topic/test1')
  t.is(client.getCtx('payload').toString(), 'hello~')
})

test.cb('subscribe, onMessage', t => {
  Promise.all([createConnection(), createConnection()])
    .then(([receiver, sender]) => {
      receiver.subscribe('topic/test2')

      t.plan(1)

      receiver.onMessage('topic/test2', m => {
        t.is(m.string, 'subscribed!')
        t.end()
      })

      sender.publish('topic/test2', 'subscribed!')
    })
})

// test.only('unsubscribe, susbcribed', async t => {
//   const [receiver, sender] = await Promise.all([createConnection(), createConnection()])

//   receiver.subscribe('topic/test1')
//   receiver.subscribe('topic/test2')

//   t.deepEqual(receiver.subscribed(), ['topic/test1', 'topic/test2'])
//   // receiver.onMessage('topic/test1', m => )
//   // sender.publish('topic/test1', '1')
// })
