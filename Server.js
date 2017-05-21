/*
	Server.js
	Created by sakshamsaxena
*/


/* 
	Get Express and Socket Up 
*/

var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var gpio = require('rpi-gpio');

/* 
	Get the current local IPv4 Address from the LAN and host the Server at that IP
*/

var OS = require('os');
var Interfaces = OS.networkInterfaces();
var hostname = Interfaces.eth0[0].address;

/* 
	Middlewares and Config 
*/

var bodyParser = require('body-parser');
var RateLimit = require('express-rate-limit');

/* 
	Common Middlewares to process the Request 
*/

app.use(bodyParser.json());
app.set('json space', 4);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

/* 
	Middlewares for Status 
*/

var limiter = new RateLimit({
    windowMs: 60 * 60 * 1000,
    max: 60,
    delayMs: 0,
    delayAfter: 0,
    message: 'You have reached the maximum number of requests per hour. Please try again later.',
    statusCode: 403
});

/* 
	GPIO Setup in RPi Schema (https://pinout.xyz) 
*/

gpio.setup(11, gpio.DIR_IN, gpio.EDGE_BOTH);

/* 
	Listen to change in sensors 
*/

gpio.on('change', function(channel, value) {
    var data = {};
    data.channel = channel;
    data.value = value;

    if (value)
        console.log("Parking Slot " + channel + " Occupied.");
    else
        console.log("Parking Slot " + channel + " Vacant.");

    io.emit('SlotChange', data);
});

/* 
	Routes
*/

app.get('/', function(req, res) {
    res.render('Home');
});

app.get('/Status', function(req, res) {
    res.send("Status Goes Here");
})

/* 
	Listen to Port 3000
*/

server.listen(3000, hostname, function() {
    console.log("Pub Server is Live on " + hostname + ":3000");
});
