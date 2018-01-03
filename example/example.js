import {connect} from '../src';

(async () => {
  const client1 = await connect({ host: 'test.mosquitto.org', port: 8080 })
  client1.subscribe('topic/test')
    .on(payload => {
      console.log(payload)
    })

  const client2 = await connect({ 
    host: 'test.mosquitto.org', port: 8080,
    will:{
      topic: 'topic/test',
      payload : {
        message: 'wii message'
      }
    }
  })

  client2.publish('topic/test', { test: 1234 })
  
  console.log('subscribe -> same instance', client1.subscribe('topic/test') === client1.subscribe('topic/test'))
  console.log('subscribed', client1.subscribed())
  
  client2.on('close', evt => console.log('close', evt))
  client2.disconnect()

  client2.on('reconnect', _=> console.log('reconnected!'))
  await client2.reconnect()

  client2.publish('topic/test', { test: 12345 })
  client2.disconnect()

})()
