import { connect } from '../dist/rsup-mqtt.cjs'

(async () => {
    const client = await connect('ws://test.mosquitto.org:8080')

    let f = true
    client.subscribe('topic/test')
        .on(msg => {
            console.log(msg.string)
            if (f) {
                f = !f
                // throw 'hello~'
            }
        })

    client.on('close', async () => {
        console.log('closed')

        await client.reconnect()

        console.log('reconnected')

        console.log(client.subscribed())
        client.publish('topic/test', 're~~~???')
    })

    client.publish('topic/test', 'hello')
})()
