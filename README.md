# Rsup MQTT
> ✨ simple wrapper for the eclipes paho(mqtt client) / better clean interface

[![npm](https://img.shields.io/npm/v/rsup-mqtt.svg?style=flat-square)](https://www.npmjs.com/package/rsup-mqtt)
[![npm](https://img.shields.io/npm/dt/rsup-mqtt.svg?style=flat-square)](https://www.npmjs.com/package/rsup-mqtt)

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
const client = await connect({host:'broker.mqttdashboard.com', port: 8000})

client.subscribe('topic')
client.onMessage('topic', message => console.log(message.string))
client.publish('topic', 'hello mqtt')
```
output
```
hello mqtt
```
### Fluent interface
```js
const subscription = client.subscribe('topic');

subscription
  .on(message => console.log(message.string))
  .publish('hello mqtt')
```
### Listen to all messages
```js
client.on('message', (topic, message)=>{
  console.log(message.string)
})
```

## API
### connect(options:object):Promise\<Client>
Connects to the broker. supports async/await.
- `options` (paho options is also available)
  - `host` required.
  - `port` defaults `4433`
  - `path` defaults `'/mqtt'`
  - `ssl` defaults `false`
  - `clientId` defaults random string
  - `keepalive` defaults `20`
  - `will` optional
    - `topic`
    - `payload`
    - `qos` defaults `2`
    - `retain` defaults `false`

---

### Client#on(eventName:string, listener:function)
Add an event listener.

#### Events
- message
- close
- reconnect

### Client#onMessage(topic:string, listener:function)
Add an topic listener.

### Client#once(eventName:string, listener:function)
Add an event listener. Runs once.

### Client#off(eventName:string, listener:function?)
Remove the event listener(s).

### Client#subscribe(topic:string):Subscription
Subscribe to a topic.

### Client#unsubscribe(removeListeners:bool = false)
Unsubscribe from a topic.

### Client#subscribed()
Returns an array of subscribed topic.

### Client#publish(topic:string, payload:string|object|Buffer, options:object)
Publish a message to a topic.
- `options`
  - `qos` defaults `2`
  - `retain` defaults `false`

### Client#send(topic:string, payload:string|object|Buffer, options:object)
@alias `publish()`

### Client#disconnect()
Disconnect the connection.

### Client#reconnect():Promise
Connect again using the same options. supports async/await.

---

### Subscription#on(listener:function):this
Add an listener.

### Subscription#off(listener:function?):this
Remove the listener(s).

### Subscription#publish(payload:string|object|Buffer, options:object):this
Publish a message. (@see `Client#publish`)

### Subscription#send(payload:string|object|Buffer, options:object):this
@alias `publish()`

### Subscription#unsubscribe(removeListeners:bool = false):this
Unsubscribe the subscription.

---
### Message#topic:string
Returns a topic.

### Message#string:string
Returns a payload of string type.

### Message#json:object
Returns a payload of json type.

### Message#bytes:Buffer
Returns a payload of buffer type.

## Better things than Paho Client
### 🔗 connection process.
before
```js
const client = new Paho.MQTT.Client(host, port);

client.connect({
  onSuccess:function(){
    client.subscribe('topic')
  }
});
```
after
```js
const client = await connect({host,  port})
client.subscribe('topic')
```

### ✉️ message handling.
before
```js
client.onMessageArrived = message => {
  const topic = message.destinationName
  const json = JSON.parse(message.payloadString)

  console.log(topic, json)
}
// can not add more listeners
```
after
```js
client.on('message', (topic, message)=>{
  console.log(topic, message.json)
})
```

### 📬 subscription (fluent interface)
```js
const subscription = client.subscribe('topic')

subscription
  .on(message => console.log(message.string))
  .publish('hello mqtt')
  .unsubscribe()
```

### 🔧 fixed a problem that prevented exception.
before
```js
client.onMessageArrived = message => {
  throw new Error("throws an error")
}
// nothing..
```

after
```js
client.on('message', (topic, message)=>{
  throw new Error("throws an error")
})
//fire error
```

## License
MIT