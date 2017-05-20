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
const os = require('os');

var ifaces = os.networkInterfaces();
if(ifaces.wlan0 !== undefined && ifaces.wlan0[0].family == 'IPv4')
	hostname = ifaces.wlan0[0].address;
if(ifaces.eth0 !== undefined && ifaces.eth0[0].family == 'IPv4')
	hostname = ifaces.eth0[0].address;
// // Setup the current IP as the server IP
// Object.keys(ifaces).forEach(function (ifname) {
//   var alias = 0;
//   ifaces[ifname].forEach(function (iface) {
//     if ('IPv4' !== iface.family || iface.internal !== false) {
//       // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
//       return;
//     }
//     if (alias >= 1) {
// 	hostname = 'localhost';
//     } else {
// 	hostname = iface.address;
//     }
//   });
// });

/* Middlewares and Config */
const bodyParser = require('body-parser');
const RateLimit = require('express-rate-limit');

/* Common Middlewares to process the Request */
app.use(bodyParser.json());
app.set('json space', 4);
app.set('view engine', 'pug');
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
var channels = [11];
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

/* Listen to Port 3000 */
app.listen(3000, hostname, function() {
	console.log("Pub Server is Live on 3000.")
});
