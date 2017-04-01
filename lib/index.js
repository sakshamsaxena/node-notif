/*
index.js 
Backend service which monitors the database for changes.
Created by sakshamsaxena
*/

/* Require these modules */

var co = require('co'); /* Generator based control flow */
var Robe = require('robe'); /* ODM for Mongo DB based on ES6 standards*/
var push = require('./server.js');
const config = require('../util/config.js');

var fieldNameList = [],
	ids = [];

co(function*(argument) {

	/* Set up connection to db */
	var db = yield Robe.connect(config.db.url);
	var collection = db.collection(config.db.collection);

	/* Get all field names */
	var fieldName = yield collection.find({
	}, {
		fields: [config.db.fieldName]
	});

	/* Set an array of the same */
	fieldNameList = fieldName.map(function(r) {
		ids.push(r._id);
		return r.name;
	});

	/* Set an array of the ids of field names for identification in oplog tailing */
	ids = fieldName.map(function(r) {
		return r._id;
	});

	/* Get the oplog */
	var oplog = yield db.oplog();

	/* Start it*/
	yield oplog.start();

	/* Listen for update operation on field names collection */
	oplog.on(config.db.collection + ':' + config.db.operation, function(collName, operation, data, o2) {

		/* Operation performed! Get the field name through id*/
		var name = null;
		for (var i = 0; i < fieldNameList.length; i++) {
			if ((ids[i]).toString() == (o2._id).toString()) {
				name = fieldNameList[i];
				break;
			}
		};

		data = [name, data];

		/* Pushing out relevant messages*/
		push.sendOut(data);
	});
});