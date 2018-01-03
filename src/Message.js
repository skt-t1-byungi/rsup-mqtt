export default class Message {
  constructor (pahoMessgae) {
    this._pahoMessgae = pahoMessgae
  }

  get topic () {
    return this._pahoMessgae.destinationName
  }

  get json () {
    return JSON.parse(this.string)
  }

  get string () {
    return this._pahoMessgae.payloadString
  }

  get bytes () {
    return this._pahoMessgae.payloadBytes
  }

  toString () {
    return this._pahoMessgae.payloadString
  }
}
