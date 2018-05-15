export default class Message {
  constructor (pahoMessage) {
    this._pahoMessage = pahoMessage
  }

  get topic () {
    return this._pahoMessage.destinationName
  }

  get json () {
    return JSON.parse(this.string)
  }

  get string () {
    return this._pahoMessage.payloadString
  }

  get bytes () {
    return this._pahoMessage.payloadBytes
  }

  toString () {
    return this._pahoMessage.payloadString
  }
}
