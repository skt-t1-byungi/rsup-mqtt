export default class Subscription {
  constructor (topic, client) {
    this._topic = topic
    this._client = client
  }

  on (listener) {
    this._client.onMessage(this._topic, listener)

    return this
  }

  off (listener = null) {
    this._client.removeMessageListener(this._topic, listener)

    return this
  }

  unsubsribe (removeListners = false) {
    this._client.unsubsribe(this._topic, removeListners)
  }
}
