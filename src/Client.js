import EventEmitter from './EventEmitter'
import Subscription from './Subscription'
import Message from './Message'
import makePahoMessage from './makePahoMessage'

export default class Client {
  constructor (paho, pahoOptions) {
    this._paho = paho
    this._pahoOptions = pahoOptions
    this._subscriptions = {}
    this._emitter = new EventEmitter()

    paho.onMessageArrived = this._handleOnMessage.bind(this)
    paho.onConnectionLost = this._handleOnClose.bind(this)
  }

  _handleOnMessage (message) {
    const payload = new Message(message)
    const topic = payload.topic

    try {
      this._emitter.emit(`message:${topic}`, payload)
      this._emitter.emit('message', topic, payload)
    } catch (error) {
      setTimeout(() => { throw error }, 0)
    }
  }

  _handleOnClose (response) {
    try {
      this._emitter.emit('close', response)
    } catch (error) {
      setTimeout(() => { throw error }, 0)
    }
  }

  on (eventName, listener) {
    this._emitter.on(eventName, listener)
  }

  onMessage (topic, listener) {
    this.on(`message:${topic}`, listener)
  }

  once (eventName, listener) {
    this._emitter.once(eventName, listener)
  }

  off (eventName, listener = null) {
    this._emitter.off(eventName, listener)
  }

  removeMessageListener (topic, listener = null) {
    this.off(`message:${topic}`, listener)
  }

  subscribe (topic) {
    this._paho.subscribe(topic)

    return (this._subscriptions[topic] || (this._subscriptions[topic] = new Subscription(topic, this)))
  }

  unsubscribe (topic, removeListeners = false) {
    this._paho.unsubscribe(topic)

    delete this._subscriptions[topic]

    if (removeListeners) {
      this.off(topic)
    }
  }

  subscribed () {
    return Object.keys(this._subscriptions)
  }

  send (topic, payload, {qos, retain} = {qos: 2, retain: false}) {
    this._paho.send(makePahoMessage(topic, payload, qos, retain))
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
