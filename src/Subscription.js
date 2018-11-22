export default class Subscription {
    constructor (topic, client) {
        this._topic = topic
        this._client = client
    }

    get topic () {
        return this._topic
    }

    on (listener) {
        this._client.onMessage(this._topic, listener)

        return this
    }

    once (listener) {
        this._client.once(`message:${this._topic}`, listener)

        return this
    }

    off (listener) {
        this._client.removeMessageListener(this._topic, listener)

        return this
    }

    unsubscribe (removeListeners = false) {
        this._client.unsubscribe(this._topic, removeListeners)

        return this
    }

    send (...args) {
        this._client.send(this._topic, ...args)

        return this
    }

    publish (...args) {
        this.send(...args)

        return this
    }
}
