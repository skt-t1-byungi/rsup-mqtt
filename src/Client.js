import EventEmitter from '@skt-t1-byungi/event-emitter'
import Subscription from './Subscription'
import Message from './Message'
import makePahoMessage from './makePahoMessage'
import pahoConnect from './pahoConnect'
import ERROR from './errorCodes'

export default class Client {
  constructor ({paho, pahoOpts}) {
    this._paho = paho
    this._pahoOpts = pahoOpts
    this._subscriptions = {}
    this._emitter = new EventEmitter()

    paho.onMessageArrived = this._handleOnMessage.bind(this)
    paho.onMessageDelivered = this._handleOnSent.bind(this)
    paho.onConnectionLost = this._handleOnClose.bind(this)
  }

  get host () {
    return this._paho.host
  }

  get port () {
    return this._paho.port
  }

  get path () {
    return this._paho.path
  }

  get uri () {
    return this._paho.uri
  }

  get clientId () {
    return this._paho.clientId
  }

  isConnected () {
    return this._paho.isConnected()
  }

  _handleOnMessage (pahoMessage) {
    const message = new Message(pahoMessage)
    const topic = message.topic

    this._emitter.emit(`message:${topic}`, message)
    this._emitter.emit('message', topic, message)
  }

  _handleOnSent (pahoMessage) {
    const message = new Message(pahoMessage)
    const topic = message.topic

    this._emitter.emit(`sent:${topic}`, message)
    this._emitter.emit('sent', topic, message)
  }

  _handleOnClose (response) {
    if (response.reconnect) {
      this._emitter.emit('reconnect', response)
    } else {
      this._emitter.emit('close', response)
    }

    // for error handling
    if (response.errorCode === ERROR.OK) return

    if (!this._emitter.has('error')) {
      throw new Error(response.errorMessage)
    } else {
      this._emitter.emit('error', response)
    }
  }

  on (eventName, listener) {
    this._emitter.on(eventName, listener)
  }

  onMessage (topic, listener) {
    this.on(`message:${topic}`, listener)
  }

  onSent (topic, listener) {
    this.on(`sent:${topic}`, listener)
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

  send (topic, payload, opts) {
    this._paho.send(makePahoMessage(topic, payload, opts))
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
    return pahoConnect(this._paho, this._pahoOpts)
      .then(() => this._emitter.emit('reconnect'))
  }
}
