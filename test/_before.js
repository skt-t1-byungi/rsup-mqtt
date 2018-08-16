import test from 'ava'
import getPort from 'get-port'
import {start, stop} from './helpers/server'
import {connect} from '../src'

let port
const ctx = {}

test.before(async t => {
  port = await getPort()
  return start(port, ctx)
})

test.after(stop)

export const createConnection = opts => connect({host: 'localhost', port, ...opts})
