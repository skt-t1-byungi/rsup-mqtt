import Paho from 'paho-mqtt'
import Client from './Client'
import makePahoMessage from './makePahoMessage'
import pahoConnect from './pahoConnect'
import deepExtend from 'deep-extend'

export default function connect (userOpts = {}, CtorDeprecated = Client) {
    if (typeof userOpts === 'string') userOpts = parseUri(userOpts)

    let {
        host,
        path = '/',
        ssl = false,
        clientId = 'mqtt_' + Math.random().toString(16).substr(2, 8),
        keepalive = 60,
        port = ssl ? 443 : 80,
        Constructor = CtorDeprecated || Client,
        hosts,
        will,
        username,
        ...etcOpts
    } = userOpts

    if (typeof Constructor !== 'function') {
        throw new TypeError('The second argument must be a function, or a constructor.')
    }

    const pahoOpts = {
        useSSL: ssl,
        keepAliveInterval: keepalive
    }

    if (!host) {
        if (hosts && hosts.length > 0) {
            host = hosts[0]
        } else {
            throw new TypeError('`host` option is required!')
        }
    }
    if (host.slice(-1) === '/') host = host.slice(0, -1)
    if (path[0] !== '/') path = '/' + path

    if (will) pahoOpts.willMessage = makePahoMessage(will.topic, will.payload, will)
    if (username) pahoOpts.userName = username
    if (hosts) pahoOpts.hosts = hosts

    const paho = new Paho.Client(host, port, path, clientId)

    return pahoConnect(paho, deepExtend(pahoOpts, etcOpts))
        .then(() => createClient(Constructor, { paho, pahoOpts }))
}

function createClient (Ctor, setting) {
    return (Client === Ctor || Ctor.prototype instanceof Client) ? new Ctor(setting) : Ctor(setting)
}

function parseUri (str) {
    const regexp = /^((wss?):\/\/)?([^/]+?)(:(\d+))?(\/.*)?$/
    const [,, protocol, host,, port, path] = str.match(regexp)
    return { ssl: protocol === 'wss', port: port && parseInt(port), host, path }
}
