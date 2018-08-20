export default class ClientError extends Error {
  constructor (code, message) {
    super(message)

    this._code = code
    this._message = message
  }

  get code () {
    return this._code
  }

  get message () {
    return this._message
  }

  is (code) {
    return this._code === code
  }

  occurred () {
    return this._code !== 0
  }
}
