import Paho from 'paho-client'

function isBuffer (value) {
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value)
}

export default function makePahoMessage (topic, payload, qos = 2, retain = false) {
  if (typeof payload === 'object' && !isBuffer(payload)) {
    payload = JSON.stringify(payload)
  }

  const message = new Paho.Message(payload)

  message.destinationName = topic
  message.qos = qos
  message.retained = retain

  return message
}
