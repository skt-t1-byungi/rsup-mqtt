export default class EventEmitter {
  constructor () {
    this._listeners = {}
  }

  on (name, listener) {
    (this._listeners[name] || (this._listeners[name] = [])).push(listener)
  }

  once (name, listener) {
    const wrapper = (...args) => {
      listener(...args)
      this.off(name, listener)
    }

    this.on(name, wrapper)
  }

  off (name, listener = null) {
    if (listener) {
      this._listeners[name] = (this._listeners[name] || []).filter(fn => fn !== listener)
    } else {
      delete this._listeners[name]
    }
  }

  emit (name, ...args) {
    (this._listeners[name] || []).slice().forEach(listener => listener(...args))
  }
}
