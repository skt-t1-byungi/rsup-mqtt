/*!
 * rsup-mqtt v0.0.1
 * (c) 2018-present skt-t1-byungi <tiniwz@gmail.com>
 * Released under the MIT License.
 */
import Paho from 'paho.mqtt.js';

var EventEmitter = function EventEmitter() {
  this._listeners = {};
};

EventEmitter.prototype.on = function on (name, fn) {
  (this._listeners[name] || (this._listeners[name] = [])).push(fn);
};

EventEmitter.prototype.off = function off (name, fn) {
    if ( fn === void 0 ) fn = null;

  if (fn) {
    this._listeners[name] = (this._listeners[name] || []).filter(function (listener) { return fn !== listener; });
  } else {
    delete this._listeners[name];
  }
};

EventEmitter.prototype.emit = function emit (name) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  (this._listeners[name] || []).slice().forEach(function (listener) { return listener.apply(void 0, args); });
};

var Subscription = function Subscription(topic, client) {
  this._topic = topic;
  this._client = client;
};

Subscription.prototype.on = function on (listener) {
  this._client.on(this._topic, listener);

  return this;
};

Subscription.prototype.off = function off (listener) {
    if ( listener === void 0 ) listener = null;

  this._client.off(this._topic, listener);

  return this;
};

Subscription.prototype.unsubsribe = function unsubsribe (removeListners) {
    if ( removeListners === void 0 ) removeListners = false;

  this._client.unsubsribe(this._topic, removeListners);
};

var Client = function Client(paho, pahoOptions) {
  this._paho = paho;
  this._pahoOptions = pahoOptions;
  this._subscriptions = {};
  this._emitter = new EventEmitter();

  paho.onMessageArrived = this._onMessage.bind(this);
  paho.onConnectionLost = this._onClose.bind(this);
};

Client.prototype._onMessage = function _onMessage (message) {
  var topic = message.destinationName;
  var payload;
  try {
    payload = JSON.parse(message.payloadString);
  } catch (e) {
    payload = { message: message.payloadString };
  }

  try {
    this._emitter.emit(topic, payload);
    this._emitter.emit('*', topic, payload);
  } catch (error) {
    setTimeout(function () {
      throw error;
    }, 0);
  }
};

Client.prototype._onClose = function _onClose (response) {
  try {
    this._emitter.emit('close', response);
  } catch (error) {
    setTimeout(function () {
      throw error;
    }, 0);
  }
};

Client.prototype.on = function on (topic, listener) {
  this._emitter.on(topic, listener);
};

Client.prototype.once = function once (topic, listener) {
  this._emitter.once(topic, listener);
};

Client.prototype.off = function off (topic, listener) {
    if ( listener === void 0 ) listener = null;

  this._emitter.off(topic, listener);
};

Client.prototype.subscribe = function subscribe (topic) {
  this._paho.subscribe(topic);

  return this._subscription(topic);
};

Client.prototype._subscription = function _subscription (topic) {
  this._subscriptions[topic] = this._subscriptions[topic] || new Subscription(topic, this);

  return this._subscriptions[topic];
};

Client.prototype.unsbscribe = function unsbscribe (topic, removeListners) {
    if ( removeListners === void 0 ) removeListners = false;

  this._paho.unsubscribe(topic);
  delete this._subscriptions[topic];

  if (removeListners) {
    this.off(topic);
  }
};

Client.prototype.subscribed = function subscribed () {
  return Object.keys(this._subscriptions);
};

Client.prototype.send = function send (topic, payload, qos) {
    if ( qos === void 0 ) qos = 2;

  this._paho.send(topic, JSON.stringify(payload), qos);
};

/**
 * @alias this.send
 */
Client.prototype.publish = function publish () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

  (ref = this).send.apply(ref, args);
    var ref;
};

Client.prototype.disconnect = function disconnect () {
  this._paho.disconnect();
};

Client.prototype.reconnect = function reconnect () {
    var this$1 = this;

  return new Promise(function (resolve, reject) {
    this$1._paho.connect(Object.assign({}, this$1._pahoOptions, {

      onSuccess: function () {
        resolve();
        this$1._emitter.emit('reconnect');
      },
      onFailure: function (error) { return reject(error); }
    }));
  });
};

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) { continue; } if (!Object.prototype.hasOwnProperty.call(obj, i)) { continue; } target[i] = obj[i]; } return target; }

function connect(options) {
  var port = options.port; if ( port === void 0 ) port = 4433;
  var path = options.path; if ( path === void 0 ) path = '/mqtt';
  var ssl = options.ssl; if ( ssl === void 0 ) ssl = false;
  var clientId = options.clientId; if ( clientId === void 0 ) clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
  var host = options.host;
  var will = options.will;
  var etcOptions = _objectWithoutProperties(options, ['port', 'path', 'ssl', 'clientId', 'host', 'will']);

  return new Promise(function (resolve, reject) {
    var pahoOptions = Object.assign({
      // rsupport default option
      useSSL: ssl,
      timeout: 2,
      keepAliveInterval: 20,
      cleanSession: true,
      mqttVersion: 3

    }, etcOptions);

    // convert will message
    if (will) {
      var message = new Paho.Message(JSON.stringify(will.payload || {}));
      message.destinationName = will.topic;
      message.qos = will.qos || 2;
      message.retained = will.retain || true;

      pahoOptions.willMessage = message;
    }

    var paho = new Paho.Client(host, port, path, clientId);

    paho.connect(Object.assign({}, pahoOptions, {

      onSuccess: function () { return resolve(new Client(paho, pahoOptions)); },
      onFailure: function (error) { return reject(error); }
    }));
  });
}

export { connect, Client };
