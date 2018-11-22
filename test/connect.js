import test from 'ava'
import { Client } from '../src'
import { createConnection, getPort } from './_hooks'

test('connect fail', async t => {
    t.plan(1)
    try {
        await createConnection({ host: 'localhost', port: 1 })
    } catch (err) {
        t.pass()
    }
})

test('connect success', async t => {
    const client = await createConnection()
    t.true(client instanceof Client)
})

test('normalize uri', async t => {
    const uri = 'ws://localhost:' + getPort()
    const client = await createConnection(uri + '/test')

    t.truthy(client.uri.match(uri))
    t.is(client.host, 'localhost')
    t.is(client.port, getPort())
    t.is(client.path, '/test')
})

test('hosts fallback', async t => {
    const client = await createConnection({
        hosts: [
            'ws://localhost:1/',
            `ws://localhost:${getPort()}/`
        ]
    })

    t.is(client.port, getPort())
})

test('custom client instance', async t => {
    const CustomClient = class extends Client {}

    const client1 = await createConnection(null, CustomClient)
    t.true(client1 instanceof CustomClient)

    const client2 = await createConnection(null, setting => new CustomClient(setting))
    t.true(client2 instanceof CustomClient)
})
