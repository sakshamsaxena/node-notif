/* Require these modules */
var express = require('express'); /* Minimalistic server */
var co = require('co'); /* Generator based control flow */
var Robe = require('robe'); /* ODM for Mongo DB based on ES6 standards*/
var events = require('events'); /* to define our own events */

var eventEmitter = new events.EventEmitter();

co(function*(argument) {
	var db = yield Robe.connect('localhost/mydb');
	var collection = db.collection('events');

	var item = yield collection.findOne({
		boom: "Grunt"
	});

	console.log(Object.keys(item));
});
/* set up connection to db */

/* set up events */

/* flexible callback for events */
function pushNotif(x, y, z) {
	/* takes in the newly added data as an arg
	and pushes out the relevant part of it */

}

/* set up watchers */