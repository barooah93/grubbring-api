// Dependencies
var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;


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

// GET: pull ring detail for a ring.
/* Search fields:
    - ring name
    - ring ID
    - ring leader username
    - ring leader first name last name

*/
app.get('/search/:field/:key', function(req,res) {
    var query = null;
    
    // check if searching for whole name (first and last)
    if(req.params.field == 'name'){
        // split by special character '-'
        var name = req.params.key.split("-");
        var fname = name[0];
        var lname = name[1];
        res.send('searching for ring by name with first name =  '+ fname + ' and last name = ' + lname); 
    }
    else if(req.params.field == 'ringId'){
        // set query to find rings by ringId
    }
    else if(req.params.field == 'username'){
        // set query to find rings 
    }
    
    query = "SELECT * FROM tblUser";
    
    // connect to db and execute query
    pool.getConnection(function(err,connection){
		if(err){
			console.log(err);
		}else if(connection && 'query' in connection){
			connection.query(query,function(err, rows, fields){
			    if(err){
			        console.log(err);
			    }
			    else{
			        console.log(rows[0]);
			    }
			});
			connection.release();
		}
	});
   
});


module.exports = app;
