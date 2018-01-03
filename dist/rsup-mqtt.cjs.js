/*!
 * rsup-mqtt v0.0.1
 * (c) 2018-present skt-t1-byungi <tiniwz@gmail.com>
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Paho = _interopDefault(require('paho.mqtt.js'));

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
  this._client.onMessage(this._topic, listener);

  return this;
};

Subscription.prototype.off = function off (listener) {
    if ( listener === void 0 ) listener = null;

  this._client.removeMessageListener(this._topic, listener);

  return this;
};

Subscription.prototype.unsubsribe = function unsubsribe (removeListners) {
    if ( removeListners === void 0 ) removeListners = false;

  this._client.unsubsribe(this._topic, removeListners);
};

var Message = function Message(pahoMessgae) {
  this._pahoMessgae = pahoMessgae;
};

var prototypeAccessors = { topic: { configurable: true },json: { configurable: true },string: { configurable: true },bytes: { configurable: true } };

prototypeAccessors.topic.get = function () {
  return this._pahoMessgae.destinationName;
};

prototypeAccessors.json.get = function () {
  return JSON.parse(this.string);
};

prototypeAccessors.string.get = function () {
  return this._pahoMessgae.payloadString;
};

prototypeAccessors.bytes.get = function () {
  return this._pahoMessgae.payloadBytes;
};

Message.prototype.toString = function toString () {
  return this._pahoMessgae.payloadString;
};

Object.defineProperties( Message.prototype, prototypeAccessors );

function isBuffer(value) {
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}

function makePahoMessage(topic, payload, qos, retain) {
  if ( qos === void 0 ) qos = 2;
  if ( retain === void 0 ) retain = false;

  if (typeof payload === 'object' && !isBuffer(payload)) {
    payload = JSON.stringify(payload);
  }

  var message = new Paho.Message(payload);

  message.destinationName = topic;
  message.qos = qos;
  message.retained = retain;

  return message;
}

var Client = function Client(paho, pahoOptions) {
  this._paho = paho;
  this._pahoOptions = pahoOptions;
  this._subscriptions = {};
  this._emitter = new EventEmitter();

  paho.onMessageArrived = this._handleOnMessage.bind(this);
  paho.onConnectionLost = this._handleOnClose.bind(this);
};

Client.prototype._handleOnMessage = function _handleOnMessage (message) {
  var payload = new Message(message);
  var topic = payload.topic;

  try {
    this._emitter.emit(("message:" + topic), payload);
    this._emitter.emit('message', topic, payload);
  } catch (error) {
    setTimeout(function () {
      throw error;
    }, 0);
  }
};

Client.prototype._handleOnClose = function _handleOnClose (response) {
  try {
    this._emitter.emit('close', response);
  } catch (error) {
    setTimeout(function () {
      throw error;
    }, 0);
  }
};

Client.prototype.on = function on (eventName, listener) {
  this._emitter.on(eventName, listener);
};

Client.prototype.onMessage = function onMessage (topic, listener) {
  this.on(("message:" + topic), listener);
};

Client.prototype.once = function once (eventName, listener) {
  this._emitter.once(eventName, listener);
};

Client.prototype.off = function off (eventName, listener) {
    if ( listener === void 0 ) listener = null;

  this._emitter.off(eventName, listener);
};

Client.prototype.removeMessageListener = function removeMessageListener (topic, listener) {
    if ( listener === void 0 ) listener = null;

  this.off(("message:" + topic), listener);
};

Client.prototype.subscribe = function subscribe (topic) {
  this._paho.subscribe(topic);

  return this._subscriptions[topic] || (this._subscriptions[topic] = new Subscription(topic, this));
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

Client.prototype.send = function send (topic, payload, ref) {
    if ( ref === void 0 ) ref = { qos: 2, retain: false };
    var qos = ref.qos;
    var retain = ref.retain;

  this._paho.send(makePahoMessage(topic, payload, qos, retain));
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

function wrapPahoWill(ref) {
  var topic = ref.topic;
  var payload = ref.payload;
  var qos = ref.qos;
  var retain = ref.retain;

  return makePahoMessage(topic, payload, qos, retain);
}

function connect(options) {
  var port = options.port; if ( port === void 0 ) port = 4433;
  var path = options.path; if ( path === void 0 ) path = '/mqtt';
  var ssl = options.ssl; if ( ssl === void 0 ) ssl = false;
  var clientId = options.clientId; if ( clientId === void 0 ) clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
  var keepalive = options.keepalive; if ( keepalive === void 0 ) keepalive = 20;
  var host = options.host;
  var will = options.will;
  var username = options.username;
  var etcOptions = _objectWithoutProperties(options, ['port', 'path', 'ssl', 'clientId', 'keepalive', 'host', 'will', 'username']);

  return new Promise(function (resolve, reject) {
    var pahoOptions = Object.assign({
      // rsupport default option
      timeout: 3,
      cleanSession: true,
      mqttVersion: 3,
      useSSL: ssl,
      keepAliveInterval: keepalive

    }, etcOptions);

    if (username) {
      pahoOptions.userName = username;
    }

    if (will) {
      pahoOptions.willMessage = wrapPahoWill(will);
    }

    var paho = new Paho.Client(host, port, path, clientId);

    paho.connect(Object.assign({}, pahoOptions, {

      onSuccess: function () { return resolve(new Client(paho, pahoOptions)); },
      onFailure: function (error) { return reject(error); }
    }));
  });
}

exports.connect = connect;
exports.Client = Client;
