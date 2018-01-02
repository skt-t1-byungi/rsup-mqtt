import EventEmitter from 'eventemitter3'
import Subscription from './Subscription'

export default class Client extends EventEmitter {
  constructor (paho) {
    super()
    this._paho = paho
    this._closed = false

    paho.onMessageArrived = this._onMessage.bind(this)
    paho.onConnectionLost = this._onClose.bind(this)
  }

  _onMessage (message) {
    const topic = message.destinationName
    let payload
    try {
      payload = JSON.parse(message.payloadString)
    } catch (e) {
      payload = {message: message.payloadString}
    }

    try {
      this.emit(topic, payload)
      this.emit('*', topic, payload)
    } catch (error) {
      setTimeout(() => { throw error }, 0)
    }
  }

  _onClose (response) {
    this._closed = true

    try {
      this.emit('close', response)
    } catch (error) {
      setTimeout(() => { throw error }, 0)
    }
  }

  subscribe (topic) {
    this._paho.subscribe(topic)

    return new Subscription(topic, this)
  }

  unsbscribe (topic) {
    this._paho.unsubscribe(topic)
  }

  publish (topic, payload, qos = 2) {
    this._paho.send(topic, JSON.stringify(payload), qos)
  }

  disconnect () {
    this._paho.disconnect()
  }

  reconnect () {
    this._paho.connect()
    this._closed = false
  }
}
