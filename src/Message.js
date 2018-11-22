export default class Message {
    constructor (pahoMessage) {
        this._pahoMessage = pahoMessage
    }

    get topic () {
        return this._pahoMessage.destinationName
    }

    get json () {
        try {
            return JSON.parse(this.string)
        } catch (err) { }
    }

    get string () {
        return this._pahoMessage.payloadString
    }

    get bytes () {
        return this._pahoMessage.payloadBytes
    }

    get qos () {
        return this._pahoMessage.qos
    }

    get dup () {
        return this._pahoMessage.duplicate
    }

    get retain () {
        return this._pahoMessage.retained
    }

    toString () {
        return this._pahoMessage.payloadString
    }
}
