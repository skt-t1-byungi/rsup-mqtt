import EventEmitter from '@skt-t1-byungi/event-emitter'
import Subscription from './Subscription'
import Message from './Message'
import makePahoMessage from './makePahoMessage'

export default class Client {
  constructor ({paho, pahoOpts}) {
    this._paho = paho
    this._pahoOpts = pahoOpts
    this._subscriptions = {}
    this._emitter = new EventEmitter()

    paho.onMessageArrived = this._handleOnMessage.bind(this)
    paho.onConnectionLost = this._handleOnClose.bind(this)
  }

  static pahoConnect (paho, pahoOpts) {
    return new Promise((resolve, reject) => {
      paho.connect({
        ...pahoOpts,
        onSuccess: resolve,
        onFailure: error => reject(error)
      })
    })
  }

  _handleOnMessage (pahoMessage) {
    const message = new Message(pahoMessage)
    const topic = message.topic

    this._emitter.emit(`message:${topic}`, message)
    this._emitter.emit('message', topic, message)
  }

  _handleOnClose (response) {
    if (!this._emitter.has('close') && response.errorCode === 5) { // ERROR.INTERNAL_ERROR.code is 5
      throw new Error(response.errorMessage)
    }

    if (response.reconnect) {
      this._emitter.emit('reconnect', response)
    } else {
      this._emitter.emit('close', response)
    }
  }

  connected () {
    return this._paho.connected
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

    if (removeListeners) this.off(topic)
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
    return this.constructor.pahoConnect(this._paho, this._pahoOpts)
      .then(() => this._emitter.emit('reconnect'))
  }
}
