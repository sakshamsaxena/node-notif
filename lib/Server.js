/*
Server.js
Created by sakshamsaxena
*/

/* Get Express and Mongo Up */
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const gpio = require('rpi-gpio');

/* Middlewares and Config */
const bodyParser = require('body-parser');
const RateLimit = require('express-rate-limit');

/* Common Middlewares to process the Request */
app.use(bodyParser.json());
app.set('json space', 4);
app.set('view enginer', 'html');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
	extended: true
}));

/* Middlewares for Status */
const limiter = new RateLimit({
	windowMs: 60 * 60 * 1000,
	max: 60,
	delayMs: 0,
	delayAfter: 0,
	message: 'You have reached the maximum number of requests per hour. Please try again later.',
	statusCode: 404
});

/* GPIO Setup in BCM Schema (https://pinout.xyz) */
gpio.setMode('MODE_BCM');
var channels = [17, 22, 23, 27];
for (var i = channels.length - 1; i >= 0; i--) {
	gpio.setup(channels[i], gpio.DIR_IN);
};

/* Listen to change in sensors */
gpio.on('change', function(channel, value) {
	// Write status to database
	var data = {};

	data.channel = channel;
	data.value = value;

	// Trigger Push Notification
	io.on('connection', function(socket) {
		socket.emit('SlotChange', data);
	});

	io.close(function() {
		console.log("Message published.");
	});
});

/* Home Route */
app.get('/', function(req, res) {
	res.render('Home');
});

/* Listen to POrt 3000 */
app.listen(3000, function() {
	console.log("Pub Server is Live on 3000.")
});