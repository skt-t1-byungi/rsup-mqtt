import test from 'ava'
import getServerPort from 'get-port'
import {start, stop} from './helpers/server'
import {connect} from '../src'

let port
const ctx = {}
const clientRepo = {}

test.before(async t => {
  port = await getServerPort()
  return start(port, await getServerPort(), ctx)
})

test.after(t => {
  Object.values(clientRepo).forEach(client => client.disconnect())
  return stop()
})

export const createConnection = async (opts, Ctor) => {
  const client = await connect(typeof opts === 'string' ? opts : {host: 'localhost', port, ...opts}, Ctor)

  clientRepo[client.clientId] = client
  client.getCtx = name => (ctx[client.clientId] && ctx[client.clientId][name])

  return client
}

export const getPort = () => port
