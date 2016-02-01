'use strict'; 

var UrlShortener = require(process.cwd() + "/app/urlShortener.js");

module.exports = function(app, db) {
    
    var urlShortener = new UrlShortener(db);
    
    app.route('/')
        .get(function(req, res) {
            res.sendFile(process.cwd() + '/index.html');
        });
    
    app.route(/^\/https?:\/\/.+\..+/)
        .get(urlShortener.getShortURL);
    
    app.route('/*')
        .get(urlShortener.getOriginalURL);
    
};