'use strict';

function urlShortener(db) {
    
    var links = db.collection('links');
    var web_address = "http://fcc-url-shortener-agathalynn.c9users.io/";
    
    this.getOriginalURL = function(req, res) {
        
        var param = decodeURIComponent(req.url.slice(1));
        
        var query = {"short_param": param};
        var projection = { "_id" : 0, "original_url": 1};
        
        links.findOne(query, projection, function(err, result) {
            
            if (err) {
                throw err;
            }
            
            if (result) {
                res.redirect(result.original_url);
            } else {
                res.json({"error": "Oops!  We can't find your original URL.  If you are trying to create a new short-form URL, remember to include 'http://' or 'https://' at the beginning of the address."});
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
                        "short_url" : web_address + short_form
                        
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
    
    function createNextUsed(lastURL) {
    
        var allowed_chars = 'qwertyuiopasdfghjklzxcvbnm.1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
        var array = lastURL.split("");
        var i = lastURL.length - 1;
         
        while (i >= 0 && array[i] == 'M') {
            array[i] = 'q';
            i--;
        }
        
        if (i >= 0) {
            array[i] = allowed_chars[allowed_chars.indexOf(array[i]) + 1];
        } else {
            array.unshift('q');
        }
        
        return array.join("");
        
    }
    
    var lastUsed = db.collection('lastUsed');
    var nextUsed = '';
    
    lastUsed.findOne({}, {"_id": false}, function(err, result) {
        
        if (err) { throw err; }
        
        if (result) {
            
            var last = result.last;
            nextUsed = createNextUsed(last);
            
            lastUsed.findAndModify(
                {},
                { "_id": 1},
                { $set : { "last": nextUsed } },
                function(err, result) {
                    
                    if (err) { throw err; }
                    return callback(nextUsed);
                    
                });

        } else {
            
            nextUsed = 'q';
            
            lastUsed.insert({ "last": nextUsed }, function(err) {

                if (err) { throw err; }
                return callback(nextUsed);
                
            });
        }
    });
}

module.exports = urlShortener;