import mosca from 'mosca'

let server

export function start (port, ctx) {
  return new Promise(resolve => {
    server = new mosca.Server({
      http: {port},
      httpOnly: true
    })

    server.on('clientConnected', function (client) {
      ctx.lastConnectClient = client
    })

    server.on('published', function (packet, client) {
      ctx.lastPayload = packet.payload + ''
      ctx.lastTopic = packet.topic
      ctx.lastClient = client
    })

    server.on('ready', resolve)
  })
}

export function stop () {
  if (server) server.close()
}
