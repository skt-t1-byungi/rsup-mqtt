import { connect } from '../src';

(async () => {
    const client = await connect('ws://test.mosquitto.org:8080')

    client.on('message', (topic, message) => {
        console.log('test topic :' + message.string)
        client.disconnect()
    })

    client.subscribe('topic/test')
        .on(message => console.log(message.string))
        .publish('hello mqtt!!')
})()
