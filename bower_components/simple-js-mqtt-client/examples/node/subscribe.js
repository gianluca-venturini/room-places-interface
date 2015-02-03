var MQTT = require('../../simple-js-mqtt-client.js')

// Connect and register callback for successful connection
MQTT.connect("ltg.evl.uic.edu", "hello-MQTT-1", function() {
	console.log("Are we connected? " + MQTT.isConnected())
	// Suscribe to a channel and register a callback to handle received messages
	MQTT.subscribe('demo1', function(message) {
		console.log("Subscribed to channels: " + MQTT.getSubscriptions())
		console.log("We received `" + message + "` on channel demo1.");
		MQTT.unsubscribe('demo1');
		MQTT.disconnect();
		console.log("Are we connected? " + MQTT.isConnected())
	});
});