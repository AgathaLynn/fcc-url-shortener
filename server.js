'use strict';

var express = require('express');
var routes = require(process.cwd() + '/app/routes.js');
var mongo = require('mongodb').MongoClient,
    mongoURL = "mongodb://localhost:27017/data";

var app = express();

mongo.connect(mongoURL, function(err, db) {
    
    if (err) {
        throw new Error("Database failed to connect.");
    } else {
        console.log('Database successfully connected.');
    }
    
    routes(app, db);
    
});

app.listen(8080, function() {
    console.log('listening on port 8080');
});