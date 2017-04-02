/*
Routes.js
Created by sakshamsaxena
All the Publishing Clients (like Arduino) will hit `/Publish`, and a push notification will be sent out.
Any HTTP Client can consume the current data without auth at `/Status`, with a limit of 60 requests per hour.
*/

/* Get Express and Mongo Up */
const app = require('express')();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const RateLimit = require('express-rate-limit');

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
    delayAfter:0,
    message : 'You have reached the maximum number of requests per hour. Please try again later.',
    statusCode: 404
});

/* Publish Route */
app.put('/Publish', validateKey, function(req, res) {
	// Database Operations Goes here
	// Trigger Push Notification
});

/* Status Route */
app.get('/Status', limiter, function(req, res) {
	// Database Operations Goes here
});

/* Listen to POrt 3000 */
app.listen(3000, function() {
    console.log("Pub Server is Live on 3000.")
});
