/*
Server.js
Created by sakshamsaxena
*/

/* Get Express and Mongo Up */
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
var gpio = require('rpi-gpio');

/* Get the current local IP and host it there */
var ifaces = require('os').networkInterfaces();
if (ifaces.wlan0 !== undefined && ifaces.wlan0[0].family == 'IPv4')
    hostname = ifaces.wlan0[0].address;
if (ifaces.eth0 !== undefined && ifaces.eth0[0].family == 'IPv4')
    hostname = ifaces.eth0[0].address;

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

/* GPIO Setup in RPi Schema (https://pinout.xyz) */
gpio.setup(11, gpio.DIR_IN, gpio.EDGE_BOTH);

/* Listen to change in sensors */
gpio.on('change', function(channel, value) {
    console.log("Something Changed");
    // Write status to database
    var data = {};
    data.channel = channel;
    data.value = value;
    process.nextTick(function(data) {
        // Trigger Push Notification
        io.on('connection', function(socket) {
            console.log("Connected.\n", data);
            socket.broadcast.emit('SlotChange', data);
        });

        io.close(function() {
            console.log("Closed");
        });
    });
});

/* Home Route */
app.get('/', function(req, res) {
    res.render('Home');
});

/* Listen to Port 3000 */
server.listen(3000, hostname, function() {
    console.log("Pub Server is Live on " + hostname + ":3000");
});
