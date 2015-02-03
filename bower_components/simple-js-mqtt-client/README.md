[![Build Status](https://travis-ci.org/tebemis/simple-js-mqtt-client.svg)](https://travis-ci.org/tebemis/simple-js-mqtt-client)

This library was born to offer a consistent API to JS programmer that need an MQTT client between node.js and the browser. To do so it leverages the excellent [MQTT.js](https://github.com/adamvr/MQTT.js) for node.js and [Paho.js](http://www.eclipse.org/paho/clients/js/) (wrapped by [mqtt-ws](https://github.com/M2MConnections/mqtt-ws) ) for the browser.

## Installation (browser)

In the browser you can link to the library directly or use [Bower](http://bower.io/). In your project directory:
```
bower install simple-js-mqtt-client
```
This will download all the dependencies which need to be then manually imported or, if you prefer, requested with [require.js](http://requirejs.org/).

## Installation (node)
Use npm from your project directory.
```
npm install simple-js-mqtt-client
```
This will also install all the dependencies you need

## Use
As we said before, the library offers a consistent API to both the browser and node. The only thing that is different is how you import the `MQTT` variable that gives you access to the library. In the browser you'll do
```html
<script src="bower_components/bower-mqttws/mqttws31.js"></script>
<script src="bower_components/simple-js-mqtt-client/simple-js-mqtt-client.js"></script>
```
while in node you'll do
```javascript
var MQTT = require('simple-js-mqtt-client')
```
You can now use all the asynchronous interfaces exposed to both the browser and node by the `MQTT` object. For instance, the following chunk of code connects to a MQTT broker on our machine and subscribes to a channel registering a callback which will print the message once it is received.
```javascript
MQTT.connect("localhost", "hello-MQTT", function() {
	MQTT.subscribe('channel-1', function(message) {
		console.info("Received: " + message)
	});
});
```

## Examples (browser)
See the [hello.html](https://github.com/tebemis/simple-js-mqtt-client/blob/master/examples/browser/hello.html) example. If you want something a little more advanced check out [example.html](https://github.com/tebemis/simple-js-mqtt-client/blob/master/examples/browser/example.html)

## Examples (node)
Take a look at [publish.js](https://github.com/tebemis/simple-js-mqtt-client/blob/master/examples/node/publish.js) and [subscribe.js](https://github.com/tebemis/simple-js-mqtt-client/blob/master/examples/node/subscribe.js).

