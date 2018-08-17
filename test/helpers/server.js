import mosca from 'mosca'

let server

export function start (httpPort, port, ctx) {
  return new Promise(resolve => {
    server = new mosca.Server({ port, http: {port: httpPort} })

    server.on('published', (packet, client) => {
      if (client) ctx[client.id] = packet
    })

    server.on('ready', resolve)
  })
}

export function stop () {
  if (server) server.close()
}
