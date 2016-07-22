/* Require these modules */

var co = require('co'); /* Generator based control flow */
var Robe = require('robe'); /* ODM for Mongo DB based on ES6 standards*/
var push = require('./server.js');

var nameList = [],
	ids = [];

co(function*(argument) {

	/* set up connection to db */
	var db = yield Robe.connect('localhost/gossip-girl');
	var collection = db.collection('characters');

	/* get all names of characters */
	var names = yield collection.find({
	}, {
		fields: ['name']
	});//returns documents

	/* set an array of characters */
	nameList = names.map(function(r) {
		return r.name;
		ids.push(r._id);
	});
	/* set an array of the ids of characters for identification in oplog tailing */
	ids = names.map(function(r) {
		return r._id;
	});

	/* get the oplog */
	var oplog = yield db.oplog();

	/* start it*/
	yield oplog.start();

	/* listen for update operation on characters collection */
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
			if ((ids[i]).toString() == (o2._id).toString()) {
				name = nameList[i];
				break;
			}
		};

		/* reassign data as an array containing name and new status */
		data = [name, data.$set.status];

		/* pushing out relevant messages*/
		push.sendOut(data);

	});
});