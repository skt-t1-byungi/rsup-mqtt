import getPort from 'get-port'
import mosca from 'mosca'
import connect from '../src/connect'

export async function createServer () {
    const port = await getPort()
    const server = new mosca.Server({ port: await getPort(), http: { port } })
    await new Promise(resolve => server.once('ready', resolve))

    let packets = {}
    server.on('published', (packet, client) => {
        if (client) packets[client.id] = packet
    })

    return {
        port,
        connect: async (opts, Ctor) => {
            const client = await connect(typeof opts === 'string' ? opts : { host: 'localhost', port, ...opts }, Ctor)
            return {
                client,
                getPacket: () => packets[client.clientId]
            }
        },
        close: () => server.close()
    }
}

export function injectServerIntoContext (test) {
    test.before(async t => {
        t.context = await createServer()
    })
    test.after(t => {
        t.context.close()
    })
}
