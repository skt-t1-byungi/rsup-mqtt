export default class EventEmitter {
  constructor () {
    this._listeners = {}
  }

  on (name, fn) {
    (this._listeners[name] || (this._listeners[name] = [])).push(fn)
  }

  off (name, fn = null) {
    if (fn) {
      this._listeners[name] = (this._listeners[name] || []).filter(listener => fn !== listener)
    } else {
      delete this._listeners[name]
    }
  }

  emit (name, ...args) {
    (this._listeners[name] || []).slice().forEach(listener => listener(...args))
  }
}
