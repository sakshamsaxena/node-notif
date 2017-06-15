/*
	Server.js
	Created by sakshamsaxena
*/


/* 
	Get Express Up 
*/
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var config = require('./util/config.js');

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
app.use(bodyParser.urlencoded({ extended: true }));

/* 
	Middlewares for Publish 
*/
var validateKey = function(req, res, next) {
    /* Validation Process goes here */
    next();
}

/* 
	Middlewares for Status 
*/
var limiter = new RateLimit({
    windowMs: 60 * 60 * 1000,
    max: 60,
    delayMs: 0,
    delayAfter: 0,
    statusCode: 403,
    message: 'You have reached the maximum number of requests per hour. Please try again later.'
});

/* 
	Routes
*/
app.post('/Register', function(req, res) {
    /* New Devices/Publishers register themselves here. */
    res.end();
});

app.post('/Publish', validateKey, function(req, res) {
    /* Devices Publish data to this route. */
    var data = req.body.data;
    res.end();
});

app.get('/Status', limiter, function(req, res) {
    /* Static route to get the current (latest) status of the Device/Publisher */
    res.end();
});

app.post('/Subscribe', function(req, res) {
    /* Subscribers subscribe via this route. */
    res.end();
});

app.get('/', function(req, res) {
	/* Serve the Live Content */
});

/* 
	Listen to Port 3000
*/
server.listen(3000, function() {
    console.log("Server is Live on Port 3000");
});
