export default class Subscription {
  constructor (topic, client) {
    this._topic = topic
    this._client = client
  }

  on (listener) {
    this._client.on(this._topic, listener)

    return this
  }

  unsubsribe () {
    this._client.unsubsribe(this._topic)
  }
}
