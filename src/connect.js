import Paho from 'paho.mqtt.js'
import Client from './Client'
import makePahoMessage from './makePahoMessage'

function wrapPahoWill ({topic, payload, qos, retain}) {
  return makePahoMessage(topic, payload, qos, retain)
}

export default function connect (options) {
  const {
    port = 4433,
    path = '/mqtt',
    ssl = false,
    clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    keepalive = 20,
    host,
    will,
    username,
    ...etcOptions
  } = options

  return new Promise((resolve, reject) => {
    const pahoOptions = {
      // rsupport default option
      timeout: 3,
      cleanSession: true,
      mqttVersion: 3,
      useSSL: ssl,
      keepAliveInterval: keepalive,

      ...etcOptions
    }

    if (username) {
      pahoOptions.userName = username
    }

    if (will) {
      pahoOptions.willMessage = wrapPahoWill(will)
    }

    const paho = new Paho.Client(host, port, path, clientId)

    paho.connect({
      ...pahoOptions,

      onSuccess: () => resolve(new Client(paho, pahoOptions)),
      onFailure: error => reject(error)
    })
  })
}
