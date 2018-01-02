import {connect} from '../src';

(async () => {
  const client1 = await connect({ host: 'broker.hivemq.com', port: 8000, clientId: 'test' })
  client1.subscribe('topic/test')
    .on(payload => {
      console.log(payload)
    })

  const client2 = await connect({ host: 'broker.hivemq.com', port: 8000, clientId: 'test' })
  client2.publish('topic/test', { test: 1234 })
})()
