import Paho from 'paho.mqtt.js'
import Client from './Client'
import makePahoMessage from './makePahoMessage'

function wrapPahoWill ({topic, payload, qos, retain}) {
  return makePahoMessage(topic, payload, qos, retain)
}

export default function connect (options, Ctor = Client) {
  if (typeof Ctor !== 'function') throw new TypeError('The second argument must be a function, or a constructor.')

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
    const pahoOpts = {
      // rsupport default option
      timeout: 3,
      cleanSession: true,
      mqttVersion: 3,
      useSSL: ssl,
      keepAliveInterval: keepalive,

      ...etcOptions
    }

    if (username) pahoOpts.userName = username
    if (will) pahoOpts.willMessage = wrapPahoWill(will)

    const paho = new Paho.Client(host, port, path, clientId)

    paho.connect({
      ...pahoOpts,

      onSuccess: () => {
        try {
          const instance = (Client === Ctor || Ctor.prototype instanceof Client)
            ? new Ctor({paho, pahoOpts}) : Ctor({paho, pahoOpts})
          resolve(instance)
        } catch (err) {
          reject(err)
        }
      },
      onFailure: err => reject(err)
    })
  })
}
