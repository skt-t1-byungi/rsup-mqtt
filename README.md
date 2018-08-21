# Rsup MQTT

📢 Elegant wrapper for the paho mqtt client

[![npm](https://img.shields.io/npm/v/rsup-mqtt.svg?style=flat-square)](https://www.npmjs.com/package/rsup-mqtt)
[![npm](https://img.shields.io/npm/dt/rsup-mqtt.svg?style=flat-square)](https://www.npmjs.com/package/rsup-mqtt)

## Why
![pee](./pee.png)

Paho is fast and light, but interface is not good. 
So I wrapped a better interface...

## Install
```sh
yarn add rsup-mqtt
```
```js
//es6
import {connect} from "rsup-mqtt";

//commonjs
var connect = require('rsup-mqtt').connect;
```

### browser
```html
<script src="https://unpkg.com/rsup-mqtt"></script>
<script>
 var connect = RsupMQTT.connect;
</script>
```

## Example
### Basic
```js
const client = await connect('ws://mqtt.test.io')

client.subscribe('topic').on(message => console.log(message.string))
client.publish('topic', 'hello mqtt')

// => hello mqtt
```

## API
### connect(options [, Constructor])
Connects to the broker. Returns `Promise<Client>`.

```js
connect({host: 'mqtt.test.io', ssl: true, path: '/mqtt'})
  .then(client => { ... })

// or
connect('wss://mqtt.test.io/mqtt')
  .then(client => { ... })
```

#### Options
- `host` - Host address, required.
- `port` - Defaults is `443` or `80`.
- `path` - Defaults is `'/'`.
- `ssl` - Defaults is `false`.
- `clientId` Defaults is random string.
- `keepalive` Defaults is `60`.
- `username` Optional.
- `password` Optional.
- `cleanSession` Defaults is `false`.
- `reconnect` Defaults is `true`.
- `mqttVersion` Defaults is `4`.
- `mqttVersionExplicit` Default value is `true` if the "mqttVersion" is 4, and false otherwise.
- `will` Optional.
  - `topic` Required.
  - `payload` Required.
  - `qos` Defaults is `0`
  - `retain` Defaults is `false`.

#### Constructor
If want to extend Client.
```js
import {Client, connect} from 'rsup-mqtt'

class CustomClient extends Client{ ... }

connect(opts, CustomClient)
  .then(customClient => { ... })

//or
connect(opts, setting => new CustomClient(setting))
  .then(customClient => { ... })
```

---

### Client

#### client.on(eventName, listener)
Add an event listener.

##### Events
- message - When a message is received.
- sent - When a message is sent.
- close - When a connection is completely closed.
- error - When an error occurs.
- reconnect - When start reconnecting.

###### Message type event  - `message` | `sent`
Receive topic and message. See details about [Message](#message).

```js
client.on('sent', (topic, message) => console.log(topic, message.string))

client.publish('topic', 'hello~')
// => "topic", "hello~"
```

###### Error type event - `close` | `error` | `reconnect`
Receive error or not. See details about [Error](#error).
```js
client.on('close', err => {
  if(err.occurred()) alert('disconnected due to an connection error : ' + err.message)
})
```

#### client.once(eventName, listener)
Add an event listener. Runs once.

#### client.off(eventName [, listener])
Remove the event listener(s).

```js
client.off('message', listener)
client.off('message') // If no listener, remove all,
```

#### client.onMessage(topic, listener)
Add an listener for received message. 

```js
client.onMessage('topic', message => console.log(message.string))
```

#### client.onSent(topic, listener)
Add an listener for sent message. 

#### client.removeMessageListener(topic [, listener])
Remove the listener(s) for received message.

#### client.removeSentListener(topic [, listener])
Remove the listener(s) for sent message.

#### client.subscribe(topic)
Subscribe to a topic. Returns subscription instance. See details about [Subscription](#subscription).

#### client.unsubscribe(topic [, removeListeners])
Unsubscribe from a topic. If `removeListeners` is true, remove all the topic listeners.

#### client.subscribed()
Returns an array of subscribed topic.

```js
client.subscribe('topic1')
client.subscribe('topic2')

console.log(client.subscribed())
// => ['topic1', 'topic2']
```

#### client.publish(topic, payload [, options])
Publish a message to a topic.

```js
client.publish('topic', 'hello') // string message
client.publish('topic', {text: 'hello~'}) // Convert object to json string.
client.publish('topic', (new TextEncoder()).encode('hello')) // buffer message
```

##### `options`
 - `qos` Defaults is `0`.
 - `retain` Defaults is `false`.

#### client.send(topic, payload [, options])
Alias `client.publish()`.

#### client.disconnect()
Disconnect the connection.

#### client.reconnect()
Connect again using the same options. Returns `Promise<void>`.

---

### Subscription

#### subscription.topic
Subscribed topic.

```js
const subscription = client.subscribe('topic')

console.log(subscription.topic)
// => topic
```

#### subscription.on(listener)
Add an listener for received topic message.

#### subscription.off([listener])
Remove the topic listener(s).

#### subscription.publish(payload [, options])
Publish a message to topic.

#### subscription.send(payload [, options])
Alias `subscription.publish()`.

#### subscription.unsubscribe([removeListeners])
Unsubscribe from a topic. If `removeListeners` is true, remove all the topic listeners.

---

### Message

#### message.topic
Message's topic.

#### message.string
A payload of string type.

#### message.json
A payload of json type.

#### message.bytes
A payload of buffer type.

#### message.qos
Message's qos. Returns number.

#### message.retain
Message's retain. Returns boolean.

#### message.dup
Duplicate Message or not. Returns boolean.

---
### Error

#### error.code
Error's code number.

#### error.message
Error's message

#### error.occurred()
Error occurred or not. Returns boolean.

#### error.is(code)
Compare error code number. Returns boolean.

```js
import {ERROR} from 'rsup-mqtt'

console.log(error.is(ERROR.BUFFER_FULL))
// => true or false
```

##### Error Codes
- `OK` - No error.
- `CONNECT_TIMEOUT` - Connect timed out.
- `SUBSCRIBE_TIMEOUT` - Subscribe timed out.
- `UNSUBSCRIBE_TIMEOUT` - Unsubscribe timed out.
- `PING_TIMEOUT` - Ping timed out.
- `INTERNAL_ERROR` - Internal error.
- `CONNACK_RETURNCODE` - Bad Connack return code.
- `SOCKET_ERROR` - Socket error.
- `SOCKET_CLOSE` -	Socket closed.
- `MALFORMED_UTF` -	Malformed UTF data.
- `UNSUPPORTED` - Not supported by this browser.
- `INVALID_STATE` - Invalid state.
- `INVALID_TYPE` - Invalid type.
- `INVALID_ARGUMENT` -	Invalid argument.
- `UNSUPPORTED_OPERATION` - Unsupported operation.
- `INVALID_STORED_DATA` - Invalid data in local storage.
- `INVALID_MQTT_MESSAGE_TYPE` - Invalid MQTT message type.
- `MALFORMED_UNICODE` - Malformed Unicode string.
- `BUFFER_FULL` - Message buffer is full.

## License
MIT
