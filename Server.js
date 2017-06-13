/*
	Server.js
	Created by sakshamsaxena
*/


/* 
	Get Express, Mongo, Socket and GPIO Up 
*/

var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var MongoClient = require('mongodb').MongoClient;
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
	Routes
*/

app.post('/Publish', function(req, res) {
	/* Devices Publish data to this route. */
	var data = req.body;
	MongoClient.connect(config.db.url, function(err, db) {
		if (err) throw err;
		db.collection(config.db.collection).insertOne(data, function(err, result) {
			if (err) throw err;
			console.log("Written new status to database.");
			db.close();
		})
	});
	res.end();
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

server.listen(3000, function() {
	console.log("Server is Live on Port 3000");
});
