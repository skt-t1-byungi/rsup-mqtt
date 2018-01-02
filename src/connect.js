import {Client as PahoClient, Message} from 'paho.mqtt.js'
import Client from './Client'

export default function connect (options) {
  const {
    port = 4433,
    path = '/mqtt',
    host,
    clientId,
    will,
    ...connectOptions
  } = options

  const paho = new PahoClient(host, port, path, clientId)

  return new Promise((resolve, reject) => {
    const pahoOptions = {
      // rsupport default option
      // useSSL: true,
      timeout: 2,
      keepAliveInterval: 20,
      cleanSession: true,
      mqttVersion: 3,

      ...connectOptions,

      onSuccess: () => resolve(new Client(paho)),
      onFailure: error => reject(error)
    }

    // convert will message
    if (will) {
      const message = new Message(JSON.stringify(will.payload))
      message.destinationName = will.topic
      message.qos = will.qos
      message.retained = will.retain

      pahoOptions.willMessage = message
    }

    paho.connect(pahoOptions)
  })
}
