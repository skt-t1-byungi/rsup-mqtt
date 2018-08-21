import {connect} from '../src'

(async () => {
  const client = await connect('ws://test.mosquitto.org:8080')

  client.subscribe('topic/test')
    .on(mesg => {
      console.log(mesg.json, mesg.string, mesg.bytes)
    })

  client.publish('topic/test', 'hello')
})()
