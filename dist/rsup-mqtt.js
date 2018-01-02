module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!***********************!*\
  !*** ./src/Client.js ***!
  \***********************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Client; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_eventemitter3__ = __webpack_require__(/*! eventemitter3 */ 5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_eventemitter3___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_eventemitter3__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Subscription__ = __webpack_require__(/*! ./Subscription */ 6);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




var Client = function () {
  function Client(paho) {
    _classCallCheck(this, Client);

    this._paho = paho;
    this._subscriptions = {};
    this._emitter = new __WEBPACK_IMPORTED_MODULE_0_eventemitter3___default.a();

    paho.onMessageArrived = this._onMessage.bind(this);
    paho.onConnectionLost = this._onClose.bind(this);
  }

  _createClass(Client, [{
    key: '_onMessage',
    value: function _onMessage(message) {
      var topic = message.destinationName;
      var payload = void 0;
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
    }
  }, {
    key: '_onClose',
    value: function _onClose(response) {
      try {
        this._emitter.emit('close', response);
      } catch (error) {
        setTimeout(function () {
          throw error;
        }, 0);
      }
    }
  }, {
    key: 'on',
    value: function on(topic, listener) {
      this._emitter.on(topic, listener);
    }
  }, {
    key: 'once',
    value: function once(topic, listener) {
      this._emitter.once(topic, listener);
    }
  }, {
    key: 'off',
    value: function off(topic) {
      var listener = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      this._emitter.off(topic, listener);
    }
  }, {
    key: 'subscribe',
    value: function subscribe(topic) {
      this._paho.subscribe(topic);

      return this._subscription(topic);
    }
  }, {
    key: '_subscription',
    value: function _subscription(topic) {
      this._subscriptions[topic] = this._subscriptions[topic] || new __WEBPACK_IMPORTED_MODULE_1__Subscription__["a" /* default */](topic, this);

      return this._subscriptions[topic];
    }
  }, {
    key: 'unsbscribe',
    value: function unsbscribe(topic) {
      var removeListners = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this._paho.unsubscribe(topic);
      delete this._subscriptions[topic];

      if (removeListners) {
        this.off(topic);
      }
    }
  }, {
    key: 'subscribed',
    value: function subscribed() {
      return Object.keys(this._subscriptions);
    }
  }, {
    key: 'send',
    value: function send(topic, payload) {
      var qos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

      this._paho.send(topic, JSON.stringify(payload), qos);
    }

    /**
     * @alias this.send
     */

  }, {
    key: 'publish',
    value: function publish() {
      this.send.apply(this, arguments);
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this._paho.disconnect();
    }
  }, {
    key: 'reconnect',
    value: function reconnect() {
      this._paho.connect();
    }
  }]);

  return Client;
}();



/***/ }),
/* 1 */
/*!****************************!*\
  !*** multi ./src/index.js ***!
  \****************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Users\나루토\Documents\GitHub\rsup-mqtt\src\index.js */2);


/***/ }),
/* 2 */
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: connect, Client */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__connect__ = __webpack_require__(/*! ./connect */ 3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Client__ = __webpack_require__(/*! ./Client */ 0);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "connect", function() { return __WEBPACK_IMPORTED_MODULE_0__connect__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Client", function() { return __WEBPACK_IMPORTED_MODULE_1__Client__["a"]; });





/***/ }),
/* 3 */
/*!************************!*\
  !*** ./src/connect.js ***!
  \************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = connect;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_paho_mqtt_js__ = __webpack_require__(/*! paho.mqtt.js */ 4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_paho_mqtt_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_paho_mqtt_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Client__ = __webpack_require__(/*! ./Client */ 0);
function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }




function connect(options) {
  var _options$port = options.port,
      port = _options$port === undefined ? 4433 : _options$port,
      _options$path = options.path,
      path = _options$path === undefined ? '/mqtt' : _options$path,
      host = options.host,
      clientId = options.clientId,
      will = options.will,
      connectOptions = _objectWithoutProperties(options, ['port', 'path', 'host', 'clientId', 'will']);

  var paho = new __WEBPACK_IMPORTED_MODULE_0_paho_mqtt_js__["Client"](host, port, path, clientId);

  return new Promise(function (resolve, reject) {
    var pahoOptions = Object.assign({
      // rsupport default option
      // useSSL: true,
      timeout: 2,
      keepAliveInterval: 20,
      cleanSession: true,
      mqttVersion: 3

    }, connectOptions, {

      onSuccess: function onSuccess() {
        return resolve(new __WEBPACK_IMPORTED_MODULE_1__Client__["a" /* default */](paho));
      },
      onFailure: function onFailure(error) {
        return reject(error);
      }

      // convert will message
    });if (will) {
      var message = new __WEBPACK_IMPORTED_MODULE_0_paho_mqtt_js__["Message"](JSON.stringify(will.payload));
      message.destinationName = will.topic;
      message.qos = will.qos;
      message.retained = will.retain;

      pahoOptions.willMessage = message;
    }

    paho.connect(pahoOptions);
  });
}

/***/ }),
/* 4 */
/*!*******************************!*\
  !*** external "paho.mqtt.js" ***!
  \*******************************/
/*! dynamic exports provided */
/*! exports used: Client, Message */
/***/ (function(module, exports) {

module.exports = require("paho.mqtt.js");

/***/ }),
/* 5 */
/*!********************************!*\
  !*** external "eventemitter3" ***!
  \********************************/
/*! dynamic exports provided */
/*! exports used: default */
/***/ (function(module, exports) {

module.exports = require("eventemitter3");

/***/ }),
/* 6 */
/*!*****************************!*\
  !*** ./src/Subscription.js ***!
  \*****************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Subscription; });
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Subscription = function () {
  function Subscription(topic, client) {
    _classCallCheck(this, Subscription);

    this._topic = topic;
    this._client = client;
  }

  _createClass(Subscription, [{
    key: "on",
    value: function on(listener) {
      this._client.on(this._topic, listener);

      return this;
    }
  }, {
    key: "off",
    value: function off() {
      var listener = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      this._client.off(this._topic, listener);

      return this;
    }
  }, {
    key: "unsubsribe",
    value: function unsubsribe() {
      var removeListners = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this._client.unsubsribe(this._topic, removeListners);
    }
  }]);

  return Subscription;
}();



/***/ })
/******/ ]);