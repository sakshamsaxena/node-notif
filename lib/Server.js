/*
Server.js
Created by sakshamsaxena
*/

/* Get Express and Mongo Up */
const app = require('express')();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const RateLimit = require('express-rate-limit');
const gpio = require('rpi-gpio');
const config = require('../util/config.js');
const amqp = require('amqplib/callback_api');

/* Common Middlewares to process the Request */
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

/* Middlewares for Publish */
const validateKey = function(req, res, next) {
    // Validation Process goes here
    next();
}

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
    var ex = 'SlotStatus';
    var ch = 'Slots';
    amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, channel) {
            channel.assertExchange(ex, 'fanout', { durable: true });
            channel.publish(ex, ch, new Buffer(JSON.stringify(data)));
            console.log("Published " + new Buffer(JSON.stringify(data)));
        });
    });
})

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

/* Subscribe Route */
app.post('/Subscribe', function(req, res) {
    // Keep Subscribers up to date
});

/* Listen to POrt 3000 */
app.listen(3000, function() {
    console.log("Pub Server is Live on 3000.")
});