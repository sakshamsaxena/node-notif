var app = require('express').createServer();
var io = require('socket.io')(app);

exports.sendOut = function() {
	//emit a socket event
	io.on('connection', function(socket) {

	});
}

app.listen(80);

app.get('/', function(req, res) {

});