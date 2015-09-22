// Dependencies
var express = require('express');
var app = express();


// GET: pull all ring locations and details.
//      if no rings found, send error code
app.get('/', function(req,res){
    if(req.query.scope == "all"){
        res.send("sending all rings in your area.");
    }
    else{
        res.send("use an option like '?scope=all'");
    }
});
// POST: request to join the ring
app.post('/join', function(req,res){
    res.send('post join api is working');
});

// PUT: ring leader accepts or rejects user's request.
//          service will also notify user of ring leader's decision
app.put('/join', function(req,res){
    res.send('update api works');
});

// GET: pull ring detail for a ring via a ring name, ring ID, etc.
app.get('/search/:field/:id', function(req,res) {
   res.send('searching for ring by '+ req.params.field + ' with key ' + req.params.id); 
});

module.exports = app;
