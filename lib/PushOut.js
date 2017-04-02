/*
PushOut.js
Created by sakshamsaxena
This is invoked when a new entry is published. It fetches the list of Subscribers, and pushes out the changes.
*/
const MongoClient = require('mongodb').MongoClient;
const config = require('../util/config.js');

// MongoDB URL
var url = config.db.url;

exports.sendOut = function(data) {

    /* Get the list of Subscribers by querying the DB */
    new Promise(function(resolve, reject) {
        MongoClient.connect(url, function(err, db) {
            if (err) reject(err);
            db.collection(config.db.collection).find({}).toArray(function(err, clients) {
                resolve(clients);
            })
        });
    }).then(function(clients) {
        console.log(clients);
        /* Push out notifications to these clients */
    })
}
