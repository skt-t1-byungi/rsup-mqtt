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
const client = await connect('ws://mqtt.test.io')

client.subscribe('topic').on(message => console.log(message))
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
  - `qos` Defaults is `2`
  - `retain` Defaults is `false`.

#### Constructor
If want to extend Client.
```js
import {Client, connect} from 'rsup-mqtt'

class CustomClient extends Client{ ... }

connect(opts, CustomClient).then(customClient => { ... })

//or
connect(opts, setting => new CustomClient(setting)).then(customClient => { ... })
```

### client.on(eventName, listener)
Add an event listener.

#### Events
- message 
- sent
- close
- error
- reconnect

##### Message type event (message, sent)

##### Error type event (close, error, reconnect)


### client.onMessage(topic, listener)
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