'use strict';



function urlShortener(db) {
    
    var links = db.collection('links');
    var web_address = "http://fcc-url-shortener-agathalynn.c9users.io/";
    
    this.getOriginalURL = function(req, res) {
        
        var param = decodeURIComponent(req.url.slice(2));
        console.log(param);
        var query = {"short_param": param};
        var projection = { "_id" : 0, "original_url": 1};
        
        links.findOne(query, projection, function(err, result) {
            
            if (err) {
                throw err;
            }
            
            if (result) {
                res.redirect(result.original_url);
            } else {
                res.json({"error": "Oops!  We can't find your original URL.  If you were trying to create a new short-form URL, remember to include 'http://' or 'https://' at the beginning of the address."});
            }
            
        });
        
    };
    
    this.getShortURL = function(req, res) {
        
        var param = decodeURIComponent(req.url.slice(1));
        var query = {"original_url": param};
        var projection = {"_id": 0, "short_param": 0};
        
        links.findOne(query, projection, function(err, result) {
            
            if (err) {
                throw err;
            }
            
            if (result) {
                res.json(result);
            } else {
                
                generateShortForm(db, function(short_form) {
                    
                    links.insert({
                    
                        "original_url" : param,
                        "short_param" : short_form,
                        "short_url" : web_address + "/" + short_form
                    
                    }, function(err) {
                    
                        if (err) {
                            throw err;
                        }
                    
                        links.findOne(query, projection, function(err, doc) {
                        
                            if (err) {
                                throw err;
                            }
                        
                            res.json(doc);
                        });
                    });
                });
                
            }
        });
    };
    
}

function generateShortForm(db, callback) {
    
    var lastUsed = db.collection('lastUsed');
    
    var allowed_chars = 'qwertyuiopasdfghjklzxcvbnm.1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
    var len = allowed_chars.length;
    
    var nextUsed = '';
    
    lastUsed.findOne({}, {"_id": false}, function(err, result) {
        
        if (err) {
            throw err;
        }
        
        if (result) {
            
            var last = result.last;
            var lastchar = last.charAt(last.length - 1);
            
            if (allowed_chars.indexOf(lastchar) + 2 < len) {
                
                nextUsed = last.slice(0, last.length - 1) + allowed_chars.charAt(allowed_chars.indexOf(lastchar) + 1);
                
            } else {
                
                nextUsed = allowed_chars.charAt(0);
                
            }
            
            lastUsed.findAndModify(
                {},
                { "_id": 1},
                { $set : { "last": nextUsed } },
                function(err, result) {
                    
                    if (err) {
                        throw err;
                    }
                    return callback(nextUsed);
                });

        } else {
            
            nextUsed = allowed_chars.charAt(0);
            
            lastUsed.insert({ "last": nextUsed }, function(err) {

                if (err) {
                    throw err;
                }
                return callback(nextUsed);
                
            });
            
        }
        
    });
    
}

module.exports = urlShortener;