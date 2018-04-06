import { connect } from '../src';

(async () => {
  const client = await connect({ host: 'broker.mqttdashboard.com', port: 8000 })

  client.subscribe('topic')
    .on(message => console.log(message.string))
    .publish('hello mqtt')

  client.on('message', (topic, message) => {
    console.log('test topic :' + message.string)
    client.disconnect()
  })
})()
