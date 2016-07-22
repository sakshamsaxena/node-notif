var app = require('express')();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var nodemailer = require('nodemailer');
const config = require('../util/config.js');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(config.smtp);

// mongodb url
var url = 'mongodb://localhost:27017/subscribers';

exports.sendOut = function(data) {
	var character = (data[0]).toString();
	var status = (data[1]).toString();

	/* Get the list of interested subscribers by querying the db */
	new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;

			db.collection('subscription').find({
				[character]: true
			}).toArray(function(err, docs) {
				/* clients will be an array of those subsribers */
				clients = docs.map(function(client) {
					return client.client;
				});
				resolve(clients);
			})
		});
	}).then(function(clients) {
		console.log(clients);
		/* Push out notifications to these clients */
		/* All subscribers are only listening to the 'update' event. This notif will only be sent to the interested subscriber (which we're calling 'clients') */
		var messageToBeSent = character + " is now " + status; // "Lily is now away"

		/* setup e-mail data with unicode symbols */
		var mailOptions = {
		    from: 'Gossip Girl Service', // sender address
		    to: clients.join(', '), // list of receivers
		    subject: 'New Update on Gossip Girls', // Subject line
		    text: messageToBeSent // plaintext body
		};

		/* send mail with defined transport object */
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log(error);
		    }
		    console.log('Message sent: ' + info.response);
		});
		
	})

}

server.listen(8000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post('/subscribe', function(req, res) {
	var params = req.body;
	/*sample req : 
	to subscribe "foo@bar.com" to a and d : 
	{
		"client": "foo@bar.com"
		"a": true,
		"d": true
	}
	*/

	/*write to db */
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		console.log("Connected correctly to server");

		db.collection('subscription').insert(params, function(err, r) {
			if (err) throw err;
			db.close();
			res.send("Added Subscriber Successfully.");
		});
	});

});