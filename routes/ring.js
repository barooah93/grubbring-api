// Dependencies
var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;

//-------------------------START-----------------------------------------------------
// GET: pull all ring locations and details.
//      if no rings found, send error code
app.get('/', function(req,res){
    if(req.query.scope == "all"){
        res.send(JSON.stringify({ringId: 1, ringName: "My Ring"}));
    }
    else{
        var query = "SELECT * FROM tblUser;";   
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
    			       res.send(JSON.stringify(rows[0]));
    			    }
    			});
    			connection.release();
    		}
    	});
   
    }
});
//-------------------------END-------------------------------------------------------


//-------------------------START-----------------------------------------------------
// POST: request to join the ring
// ex: https://grubbring-api-barooah93.c9.io/api/ring/join/234/429
app.post('/join/:ringId/:userId', function(req,res){
    
    var ringId = req.params.ringId;
    var userId = req.params.userId;
    var query = null;
    
    // TODO: need error checking and validation
    
    // ring status for pending=0, approved=1, declined=2, and banned=3
    query = "INSERT INTO tblRingUser (ringId, userId, roleId, status) "+
    "VALUES ("+ringId+", "+userId+", 1, 0);";
    
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
    			       res.send("success");
    			    }
    			});
    			connection.release();
    		}
    	});
    
    // TODO: notify ring leader in charge of ringId
});
//-------------------------END-------------------------------------------------------

//-------------------------START-----------------------------------------------------
// PUT: ring leader accepts or rejects user's request.
//          service will also notify user of ring leader's decision
app.put('/join', function(req,res){
    res.send('update api works');
});
//-------------------------END-------------------------------------------------------


//-------------------------START-----------------------------------------------------
// GET: get ring details for searched ring
/* Search fields:
    - ring name
    - ring ID
    - ring leader username
    - ring leader first name last name

*/
// ex: https://grubbring-api-barooah93.c9.io/api/ring/search/leaderName/brandon-barooah
// wildcard search
app.get('/search/:field/:key', function(req,res) {
    
    var query = null;
    
    // TODO: need error checking
    
    // ex: leaderName/brandon-barooah
    if(req.params.field == 'leaderName'){
        // if no dash found see if they're searching for first name or last name
        if(req.params.key.indexOf('-') === -1)
        {
            query = "SELECT * FROM tblRing R "+
            "INNER JOIN tblUser U "+
            "ON R.createdBy=U.userId "+
            "WHERE (U.firstName LIKE '"+req.params.key+"%' "+
            "OR U.lastName LIKE '"+req.params.key+"%') " +
            "AND R.ringStatus=1;"; 
            res.send(query);
        
        }
        else{ // a full first or last name was given seperated by a '-'
            var fullEntry = req.params.key.split('-');
            var firstEntry = fullEntry[0];   // this should be a full first OR last name
            var secondEntry = fullEntry[1]; // this CAN be partially filled out since it is wildcard search
            
            query = "SELECT * FROM tblRing R "+
            "INNER JOIN tblUser U "+
            "ON R.createdBy=U.userId "+
            "WHERE "+
            "(U.firstName='"+firstEntry+"' OR U.lastName='"+firstEntry+"') "+
            "AND "+
            "(U.firstName LIKE '"+secondEntry+"%' OR U.lastName LIKE '"+secondEntry+"%') " +
            "AND "+
            "R.ringStatus=1;";
            res.send(query);
        }
        
       
    }
    else if(req.params.field == 'ringId'){
        query = "SELECT * FROM tblRing R " +
        "WHERE R.ringId LIKE '" + req.params.key + "%' "+
        "AND R.ringStatus=1;";
        res.send(query);
    }
    else if(req.params.field == 'username'){
        query = "SELECT * FROM tblRing R, tblUser U " +
        "WHERE R.createdBy = U.userId "+
        "AND U.username LIKE '" + req.params.key + "%' "+
        "AND R.ringStatus=1;";
        res.send(query);
    }
    else if(req.params.field == 'ringName'){
        query = "SELECT * FROM tblRing R " +
        "WHERE R.name LIKE '" + req.params.key + "%' "+
        "AND R.ringStatus=1;";
        res.send(query);
    }
    
    var query = "SELECT * FROM tblUser;";   
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
//-------------------------END-------------------------------------------------------


module.exports = app;
