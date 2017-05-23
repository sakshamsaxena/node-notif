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
var MongoClient = require('mongodb').MongoClient;
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
var channels = [11, 13, 15, 16];
for (var i = channels.length - 1; i >= 0; i--)
    gpio.setup(channels[i], gpio.DIR_IN, gpio.EDGE_BOTH);

/* 
	Listen to change in sensors 
*/

gpio.on('change', function(channel, value) {
    var data = {};
    data.channel = channel;
    data.value = value;
    data.time = (new Date()).getTime();

    if (value)
        console.log("[" + data.time + "] " + "Parking Slot " + channel + " Occupied.");
    else
        console.log("[" + data.time + "] " + "Parking Slot " + channel + " Vacant.");

    MongoClient.connect(config.db.url, function(err, db) {
        if (err) throw err;
        db.collection(config.db.collection).insertOne(data, function(err, result) {
            if (err) throw err;
            console.log("Written new status to database.");
            db.close();
        })
    });

    io.emit('SlotChange', data);
});

/* 
	Routes
*/

app.get('/', function(req, res) {
    res.render('Home');
});

app.get('/Status', function(req, res) {
    MongoClient.connect(config.db.url, function(err, db) {
        if (err) throw err;
        db.collection(config.db.collection).findOne({}).toArray(function(err, docs) {
            res.send(docs);
            db.close();
        })
    })
})

/* 
	Listen to Port 3000
*/

server.listen(3000, hostname, function() {
    console.log("Pub Server is Live on " + hostname + ":3000");
});
