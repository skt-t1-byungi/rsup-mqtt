import Paho from 'paho-client'
import Client from './Client'
import makePahoMessage from './makePahoMessage'

export default function connect (userOpts, Ctor = Client) {
  if (typeof Ctor !== 'function') {
    throw new TypeError('The second argument must be a function, or a constructor.')
  }

  const {
    port = 4433,
    path = '/mqtt',
    ssl = false,
    clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    keepalive = 20,
    host,
    will,
    username,
    ...etcOpts
  } = userOpts

  const pahoOpts = {
    // rsupport default option
    timeout: 3,
    cleanSession: true,
    mqttVersion: 3,
    useSSL: ssl,
    keepAliveInterval: keepalive,
    ...etcOpts
  }

  if (username) pahoOpts.userName = username
  if (will) pahoOpts.willMessage = wrapPahoWill(will)

  const paho = new Paho.Client(host, port, path, clientId)

  return Client.pahoConnect(paho, pahoOpts)
    .then(() => {
      return createClient(Ctor, {paho, pahoOpts})
    })
}

function wrapPahoWill ({topic, payload, qos, retain}) {
  return makePahoMessage(topic, payload, qos, retain)
}

function createClient (Ctor, setting) {
  return (Client === Ctor || Ctor.prototype instanceof Client) ? new Ctor(setting) : Ctor(setting)
}
