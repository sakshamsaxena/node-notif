var app = require('express')();
var MongoClient = require('mongodb').MongoClient;
// var io = require('socket.io')(app);
var bodyParser = require('body-parser')

exports.sendOut = function() {
	//emit a socket event
	io.on('connection', function(socket) {

	});
}
var url = 'mongodb://localhost:27017/subscribers';

app.listen(8000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post('/subscribe', function(req, res) {
	var params = req.body;
	/*sample req : 
	to subscribe "foo" to a and d : 
	{
		"client": "foo"
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