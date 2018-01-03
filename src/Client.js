import EventEmitter from './EventEmitter'
import Subscription from './Subscription'

export default class Client {
  constructor (paho, pahoOptions) {
    this._paho = paho
    this._pahoOptions = pahoOptions
    this._subscriptions = {}
    this._emitter = new EventEmitter()

    paho.onMessageArrived = this._onMessage.bind(this)
    paho.onConnectionLost = this._onClose.bind(this)
  }

  _onMessage (message) {
    const topic = message.destinationName
    let payload
    try {
      payload = JSON.parse(message.payloadString)
    } catch (e) {
      payload = { message: message.payloadString }
    }

    try {
      this._emitter.emit(topic, payload)
      this._emitter.emit('*', topic, payload)
    } catch (error) {
      setTimeout(() => { throw error }, 0)
    }
  }

  _onClose (response) {
    try {
      this._emitter.emit('close', response)
    } catch (error) {
      setTimeout(() => { throw error }, 0)
    }
  }

  on (topic, listener) {
    this._emitter.on(topic, listener)
  }

  once (topic, listener) {
    this._emitter.once(topic, listener)
  }

  off (topic, listener = null) {
    this._emitter.off(topic, listener)
  }

  subscribe (topic) {
    this._paho.subscribe(topic)

    return this._subscription(topic)
  }

  _subscription (topic) {
    this._subscriptions[topic] = this._subscriptions[topic] || new Subscription(topic, this)

    return this._subscriptions[topic]
  }

  unsbscribe (topic, removeListners = false) {
    this._paho.unsubscribe(topic)
    delete this._subscriptions[topic]

    if (removeListners) {
      this.off(topic)
    }
  }

  subscribed () {
    return Object.keys(this._subscriptions)
  }

  send (topic, payload, qos = 2) {
    this._paho.send(topic, JSON.stringify(payload), qos)
  }

  /**
   * @alias this.send
   */
  publish (...args) {
    this.send(...args)
  }

  disconnect () {
    this._paho.disconnect()
  }

  reconnect () {
    return new Promise((resolve, reject) => {
      this._paho.connect({
        ...this._pahoOptions,

        onSuccess: () => {
          resolve()
          this._emitter.emit('reconnect')
        },
        onFailure: error => reject(error)
      })
    })
  }
}
