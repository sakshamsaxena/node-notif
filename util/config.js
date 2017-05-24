/* Configuration Data  */

/* Configuration for database */
exports.db = {
	url 		: 'mongodb://localhost/slotsData',
	collection 	: 'slots'
};

/* Configuration for identification of Pi (Server) which represents a parking lot */
exports.parkingLot = {
	name 		: "PI NAME",
	_id		: "ID"
}

/* Configure the map between the sensor channels and the physical slot number 	*/
exports.slots = {
	_11		: 1
}