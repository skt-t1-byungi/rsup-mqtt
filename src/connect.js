import {Clien as PahoClient} from './paho.mqtt.js'
import Client from './Client'

export default function connect (options) {
  const {
    port = 4433,
    path = '/mqtt',
    host,
    clientId,
    ...connectOptions
  } = options

  const paho = new PahoClient(host, port, path, clientId)

  return new Promise((resolve, reject) => {
    paho.connect({
      // rsupport default option
      timeout: 2,
      useSSL: true,
      keepAliveInterval: 20,
      cleanSession: true,
      mqttVersion: 3,

      ...connectOptions,

      onSuccess: () => resolve(new Client(paho)),
      onFailure: error => reject(error)
    })
  })
}
