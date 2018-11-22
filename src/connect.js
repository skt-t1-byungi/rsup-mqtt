import Paho from 'paho-client'
import Client from './Client'
import makePahoMessage from './makePahoMessage'
import pahoConnect from './pahoConnect'

export default function connect (userOpts = {}, Ctor = Client) {
    if (typeof Ctor !== 'function') {
        throw new TypeError('The second argument must be a function, or a constructor.')
    }

    if (typeof userOpts === 'string') userOpts = parseUriToOpts(userOpts)

    let {
        host,
        path = '/',
        ssl = false,
        clientId = 'mqtt_' + Math.random().toString(16).substr(2, 8),
        keepalive = 60,
        port = ssl ? 443 : 80,
        hosts,
        will,
        username,
        ...etcOpts
    } = userOpts

    if (!host) throw new TypeError('`host` option is required!')
    if (host.slice(-1) === '/') host = host.slice(0, -1)
    if (path[0] !== '/') path = '/' + path

    const pahoOpts = {
        useSSL: ssl,
        keepAliveInterval: keepalive
    }

    if (will) pahoOpts.will = wrapPahoWill(will)
    if (username) pahoOpts.userName = username
    if (hosts) pahoOpts.hosts = hosts

    Object.assign(pahoOpts, etcOpts)

    const paho = new Paho.Client(host, port, path, clientId)

    return pahoConnect(paho, pahoOpts)
        .then(() => {
            return createClient(Ctor, { paho, pahoOpts })
        })
}

function wrapPahoWill ({ topic, payload, ...opts }) {
    return makePahoMessage(topic, payload, opts)
}

function createClient (Ctor, setting) {
    return (Client === Ctor || Ctor.prototype instanceof Client) ? new Ctor(setting) : Ctor(setting)
}

function parseUriToOpts (str) {
    const regexp = /^((wss?):\/\/)?([^/]+?)(:(\d+))?(\/.*)?$/
    const [,, protocol, host,, port, path] = str.match(regexp)

    return { ssl: protocol === 'wss', port: port && parseInt(port), host, path }
}
