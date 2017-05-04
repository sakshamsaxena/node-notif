/*
Server.js
Created by sakshamsaxena
*/

/* Get Express and Mongo Up */
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const MongoClient = require('mongodb').MongoClient;
const gpio = require('rpi-gpio');

/* Middlewares and Config */
const bodyParser = require('body-parser');
const RateLimit = require('express-rate-limit');
const config = require('../util/config.js');

/* Common Middlewares to process the Request */
app.use(bodyParser.json());
app.set('json space', 4);
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

    MongoClient.connect(config.db.url, function(err, db) {
        if (err) throw (err);
        db.collection(config.db.collection).insertOne(data, function(err, result) {
            if (err) throw (err);
            console.log(result);
        });
    });

    // Trigger Push Notification
    io.on('connection', function(socket) {
        socket.emit('SlotChange', data);
    });

    io.close(function() {
        console.log("Message published.");
    });
});

/* Status Route */
app.get('/Status', limiter, function(req, res) {
    // Database Operations Goes here
    MongoClient.connect(config.db.url, function(err, db) {
        if (err) throw (err);
        db.collection(config.db.collection).find({/* Query to fetch all latest unique channels and their values */}).toArray(function(err, docs) {
            console.log(docs);
            res.send(docs);
            db.close();
        })
    });
});

/* Listen to POrt 3000 */
app.listen(3000, function() {
    console.log("Pub Server is Live on 3000.")
});