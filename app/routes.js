'use strict'; 

module.exports = function(app) {
    
    app.route('/')
        .get(function(req, res) {
            res.sendFile(process.cwd() + '/index.html');
        });
    
    app.route(/^\/https?:\/\/.+\..+/)
        .get(function(req, res) {
            res.send("here's where I'll output json giving original and shortened apis");
        });
    
    app.route('/*')
        .get(function(req, res) {
            res.send("here's where I'll either redirect - if the url is a valid short form - or else send back an error");
        });
    
};