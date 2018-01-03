import Paho from 'paho.mqtt.js'
import Client from './Client'

export default function connect (options) {
  const {
    port = 4433,
    path = '/mqtt',
    ssl = false,
    clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    host,
    will,
    ...etcOptions
  } = options

  return new Promise((resolve, reject) => {
    const pahoOptions = {
      // rsupport default option
      useSSL: ssl,
      timeout: 2,
      keepAliveInterval: 20,
      cleanSession: true,
      mqttVersion: 3,

      ...etcOptions
    }

    // convert will message
    if (will) {
      const message = new Paho.Message(JSON.stringify(will.payload || {}))
      message.destinationName = will.topic
      message.qos = will.qos || 2
      message.retained = will.retain || true

      pahoOptions.willMessage = message
    }

    const paho = new Paho.Client(host, port, path, clientId)

    paho.connect({
      ...pahoOptions,

      onSuccess: () => resolve(new Client(paho, pahoOptions)),
      onFailure: error => reject(error)
    })
  })
}
