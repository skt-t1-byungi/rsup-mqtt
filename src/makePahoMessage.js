import Paho from 'paho-client'

export default function makePahoMessage (topic, payload, opts = {}) {
    if (typeof payload === 'object' && !isBuffer(payload)) {
        payload = JSON.stringify(payload)
    }

    const message = new Paho.Message(payload)

    message.destinationName = topic
    message.qos = opts.qos || 0
    message.retained = !!(opts.retain || opts.retained)

    return message
}

function isBuffer (value) {
    return value instanceof ArrayBuffer || ArrayBuffer.isView(value)
}
