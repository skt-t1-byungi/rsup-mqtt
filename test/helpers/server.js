import mosca from 'mosca'

let server

export function start (port, ctx) {
  return new Promise(resolve => {
    server = new mosca.Server({
      http: {port},
      httpOnly: true
    })

    server.on('published', (packet, client) => {
      ctx[client] = packet
    })

    server.on('ready', resolve)
  })
}

export function stop () {
  if (server) server.close()
}
