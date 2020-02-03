import { serial as test } from 'ava'
import delay from 'delay'
import { injectServerIntoContext } from './_helpers'

injectServerIntoContext(test)

test('publish', async t => {
    const { client, getPacket } = await t.context.connect()
    client.publish('topic/test1', 'hello~')

    await delay(300)

    t.is(getPacket().topic, 'topic/test1')
    t.is(getPacket().payload.toString(), 'hello~')
})

test('subscribe, onMessage', async t => {
    const { connect } = t.context
    const [{ client: receiver }, { client: sender }] = await Promise.all([connect(), connect()])
    receiver.subscribe('topic/subscribe-test')

    t.plan(1)
    receiver.onMessage('topic/subscribe-test', m => t.is(m.string, 'subscribed!'))
    sender.publish('topic/subscribe-test', 'subscribed!')

    await delay(300)
})

test('unsubscribe', async t => {
    const { connect } = t.context
    const [{ client: receiver }, { client: sender }] = await Promise.all([connect(), connect()])

    receiver.subscribe('topic/unsubscribe-test')
    receiver.onMessage('topic/unsubscribe-test', m => t.is(m.string, 'test1'))
    sender.publish('topic/unsubscribe-test', 'test1')

    await delay(300)

    receiver.onMessage('topic/unsubscribe-test', () => t.fail())
    receiver.unsubscribe('topic/unsubscribe-test')

    sender.publish('topic/unsubscribe-test', 'test1')
    sender.publish('topic/unsubscribe-test', 'test2')

    await delay(300)
})

test('subscribed', async t => {
    const { client } = await t.context.connect()

    client.subscribe('topic/test1')
    client.subscribe('topic/test2')

    t.deepEqual(client.subscribed(), ['topic/test1', 'topic/test2'])
})

test('onSent', async t => {
    const { connect } = t.context
    const [{ client: receiver }, { client: sender }] = await Promise.all([connect(), connect()])

    receiver.subscribe('topic/onset-test')

    t.plan(2)
    sender.onSent('topic/onset-test', m => t.is(m.string, 'qos' + m.qos))

    // qos 0
    sender.publish('topic/onset-test', 'qos0')

    // qos 1
    sender.publish('topic/onset-test', 'qos1', { qos: 1 })
    await delay(300)

    // qos2 pass - mosca does not support qos 2
})

test('disconnect, reconnect, close and reconnect evt', async t => {
    const { client } = await t.context.connect()

    t.plan(5)
    client.on('close', resp => t.pass())
    client.on('reconnect', resp => t.pass())
    t.true(client.isConnected())

    client.disconnect()
    t.false(client.isConnected())

    await client.reconnect()
    t.true(client.isConnected())
})

test('willMessage', async t => {
    const { connect } = t.context
    const [{ client: sender }, { client: receiver }] = await Promise.all([
        connect({ will: { topic: 'topic/willMessage', payload: 'closed' } }),
        connect()
    ])
    receiver.subscribe('topic/willMessage')

    t.plan(1)
    receiver.onMessage('topic/willMessage', m => t.is(m.string, 'closed'))
    sender.disconnect()

    await delay(300)
})
