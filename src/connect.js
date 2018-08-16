import {Client as PahoClient} from 'paho-client'
import Client from './Client'
import makePahoMessage from './makePahoMessage'
import pahoConnect from './pahoConnect'

export default function connect (userOpts, Ctor = Client) {
  if (typeof Ctor !== 'function') {
    throw new TypeError('The second argument must be a function, or a constructor.')
  }

  // normalize string type
  if (typeof userOpts === 'string') {
    const regexp = /^((wss?):\/\/)?([^/]+?)(:(\d+))?(\/.*)?$/
    const [,, protocol, host,, port, path] = userOpts.match(regexp)

    userOpts = { ssl: protocol === 'wss', host, port, path }
  }

  const {
    path = '/',
    ssl = false,
    clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    keepalive = 60,
    port,
    host,
    hosts,
    will,
    username,
    ...etcOpts
  } = userOpts

  const pahoOpts = {
    hosts,
    useSSL: ssl,
    keepAliveInterval: keepalive,
    userName: username,
    willMessage: will && wrapPahoWill(will),
    ...etcOpts
  }

  const paho = new PahoClient(host || hosts[0], port, path, clientId)

  return pahoConnect(paho, pahoOpts)
    .then(() => {
      return createClient(Ctor, {paho, pahoOpts})
    })
}

function wrapPahoWill ({topic, payload, ...opts}) {
  return makePahoMessage(topic, payload, opts)
}

function createClient (Ctor, setting) {
  return (Client === Ctor || Ctor.prototype instanceof Client) ? new Ctor(setting) : Ctor(setting)
}
