import { serial as test } from 'ava'
import { connect, Client } from '../src'
import { injectServerIntoContext } from './_helpers'

injectServerIntoContext(test)

test('connect fail', async t => {
    t.plan(1)
    try {
        await connect({ host: 'localhost', port: 1 })
    } catch (err) {
        t.pass()
    }
})

test('connect success', async t => {
    const { client } = await t.context.connect()
    t.true(client instanceof Client)
})

test('normalize uri', async t => {
    const { port, connect } = t.context
    const uri = 'ws://localhost:' + port
    const { client } = await connect(uri + '/test')

    t.truthy(client.uri.match(uri))
    t.is(client.host, 'localhost')
    t.is(client.port, port)
    t.is(client.path, '/test')
})

test('hosts fallback', async t => {
    const { port, connect } = t.context
    const { client } = await connect({
        hosts: [
            'ws://localhost:1/',
            `ws://localhost:${port}/`
        ]
    })
    t.is(client.port, port)
})

test('custom client instance', async t => {
    const { connect } = t.context
    const CustomClient = class extends Client {}

    const { client: client1 } = await connect(null, CustomClient)
    t.true(client1 instanceof CustomClient)

    const { client: client2 } = await connect(null, setting => new CustomClient(setting))
    t.true(client2 instanceof CustomClient)
})
