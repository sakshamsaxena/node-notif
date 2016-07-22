/* Require these modules */

var co = require('co'); /* Generator based control flow */
var Robe = require('robe'); /* ODM for Mongo DB based on ES6 standards*/
var events = require('events'); /* to define our own events */
var push = require('./server.js');

var ee = new events.EventEmitter();

var nameList = [], ids = [];

co(function*(argument) {

	/* set up connection to db */
	var db = yield Robe.connect('localhost/gossip-girl');
	var collection = db.collection('characters');

	/* get all names for event definition */
	
	var names = yield collection.find({

	}, {
		fields: ['name']
	});

	names.map(function(r) {
		nameList.push(r.name);
		ids.push(r._id);
	});

	/* set up events handlers*/
	for (var i = nameList.length - 1; i >= 0; i--) {
		(function() {
			var eventName = (nameList[i] + "Update").toString();
			ee.on(eventName, function (data) {
				/* pushing out relevant messages*/
				push.sendOut(data);
			});
		}())
	};

	/* get the oplog */
	var oplog = yield db.oplog();

	/* start it*/
	yield oplog.start();

	/* listen for insert operation on any collection */
	oplog.on('characters:update', function(collName, operation, data, o2) {
		/*
		collName is "characters" (without quotes)
		operation is "insert" (without quotes)
		data is the document(object) updated.
		o2 is the index/id of the document.
		*/

		/* Update operation performed! Get the name through id*/
		var name = null;
		for (var i = 0; i < nameList.length; i++) {
			if((ids[i]).toString() == (o2._id).toString()) {
				name = nameList[i];
				break;
			}
		};

		/* reassign data as an array containing name and new status */
		data = [name, data.$set.status];

		/* emit the event and pass the data related to it */
		var eventName = (name + "Update").toString();
		ee.emit(eventName, data);

	});
});
