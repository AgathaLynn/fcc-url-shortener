'use strict';

var express = require('express');
var routes = require(process.cwd() + '/app/routes.js');

var app = express();

routes(app);

app.listen(8080, function() {
    console.log('listening on port 8080');
});