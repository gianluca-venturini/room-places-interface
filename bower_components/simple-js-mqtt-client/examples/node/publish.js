var MQTT = require('../../simple-js-mqtt-client.js')

// Connect, publisha  message and disconnect
MQTT.connect("ltg.evl.uic.edu", "hello-MQTT-2", function() {
	MQTT.publish('demo1', "here is my message");
	MQTT.disconnect();
});