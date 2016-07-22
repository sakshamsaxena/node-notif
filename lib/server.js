var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;


var url = 'mongodb://localhost:27017/subscribers';

exports.sendOut = function(data) {
	var character = (data[0]).toString();
	var status = (data[1]).toString();
	var clients = [];
	/* Get the list of interested subscribers by querying the db */
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		console.log("Connected correctly to server for querying subscribers.");

		db.collection('subscription').find({
			[character]: true
		}).toArray(function(err, docs) {
			docs.map(function(client) {
				clients.push(client);
			});
		})
	});
}

server.listen(8000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post('/subscribe', function(req, res) {
	var params = req.body;
	/*sample req : 
	to subscribe "foo" to a and d : 
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