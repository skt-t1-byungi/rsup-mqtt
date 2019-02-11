import EventEmitter from '@byungi/event-emitter'
import Subscription from './Subscription'
import Message from './Message'
import makePahoMessage from './makePahoMessage'
import pahoConnect from './pahoConnect'
import ERROR from './errorCodes'
import ClientError from './ClientError'

export default class Client {
    constructor ({ paho, pahoOpts }) {
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

    _handleOnClose ({ errorCode, errorMessage, reconnect }) {
        const err = new ClientError(errorCode, errorMessage)

        if (reconnect) {
            this._emitter.emit('reconnect', err)
        } else {
            this._emitter.emit('close', err)
        }

        // for error handling
        if (!err.occurred()) return

        if (!this._emitter.has('error')) {
            throw err
        } else {
            this._emitter.emit('error', err)
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

    off (eventName, listener) {
        this._emitter.off(eventName, listener)
    }

    removeMessageListener (topic, listener) {
        this.off(`message:${topic}`, listener)
    }

    removeSentListener (topic, listener) {
        this.off(`sent:${topic}`, listener)
    }

    subscribe (topic) {
        this._paho.subscribe(topic)

        return (this._subscriptions[topic] || (this._subscriptions[topic] = new Subscription(topic, this)))
    }

    unsubscribe (topic, removeListeners = false) {
        this._paho.unsubscribe(topic)

        delete this._subscriptions[topic]

        if (removeListeners) this.removeMessageListener(topic)
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
        this._emitter.emit('reconnect', new ClientError(ERROR.OK, 'No error.'))

        return pahoConnect(this._paho, this._pahoOpts)
            .then(() => {
                this.subscribed().forEach(topic => this.subscribe(topic))
            })
    }
}
