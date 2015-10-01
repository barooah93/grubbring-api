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
        var query = "SELECT * FROM tblRing;";   
        dbExecuteQuery(query, function(err, result){
            if(result.status != "error"){
                // overwrite description
                result.description="Returned all rings";
            }
            res.send(result);
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
    var userRole = 1; // 0 means leader, 1 means grubbling
    var ringStatus = 0; // ring status for pending=0, approved=1, declined=2, and banned=3
    var query = null;
    
    // TODO: need error checking and validation
    
    query = "INSERT INTO tblRingUser (ringId, userId, roleId, status) "+
    "VALUES ("+ringId+", "+userId+", "+ userRole+", "+ringStatus+");"
        
    dbExecuteQuery(query, function(err, result){
        if(result.status != "error"){
            // overwrite description
            result.description="Added userId " + userId + " with pending status to ringId " + ringId;
        }
        res.send(result);
    });
    
});
//-------------------------END-------------------------------------------------------


// GET: leader get notification if someone is trying join ring
app.get('/notifyLeader', function(req,res){
    
});


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
    
    var description = "";
    
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
        }
        
        description = "Get ring details for ring leader's name: " + req.params.key + "*";
       
    }
    else if(req.params.field == 'ringId'){
        query = "SELECT * FROM tblRing R " +
        "WHERE R.ringId = '" + req.params.key + "' "+
        "AND R.ringStatus=1;";
        description = "Get ring details for ringId: " + req.params.key;
    }
    else if(req.params.field == 'username'){
        query = "SELECT * FROM tblRing R, tblUser U " +
        "WHERE R.createdBy = U.userId "+
        "AND U.username LIKE '" + req.params.key + "%' "+
        "AND R.ringStatus=1;";
        description = "Get ring details for ring leader's username: " + req.params.key;
    }
    else if(req.params.field == 'ringName'){
        query = "SELECT * FROM tblRing R " +
        "WHERE R.name LIKE '" + req.params.key + "%' "+
        "AND R.ringStatus=1;";
        description = "Get ring details for ring name: " + req.params.key;
    }
    
   // var query = "SELECT * FROM tblUser;";   
    // connect to db and execute query
    dbExecuteQuery(query, function(err, result){
        if(result.status != "error"){
            // overwrite description
            result.description=description;
        }
        res.send(result);
    });
   
});
//-------------------------END-------------------------------------------------------


// connect to db and execute query
var dbExecuteQuery = function(query, callback){
    var resultObject;
    pool.getConnection(function(err,connection){
		if(err){
			console.log(err);
			resultObject = {status:"error", description:"Cannot connect to database", data:err};
			callback(err,resultObject);
		}else if(connection && 'query' in connection){
			connection.query(query,function(err, rows, fields){
			    if(err){
			        console.log(err);
			        resultObject = {status:"error", description:"Cannot execute query", data:err};
			        callback(err, resultObject);
			    }
			    else{
			        resultObject = {status:"success", description:"Executed query", data:rows};
			        callback(null, resultObject);
			    }
			});
			connection.release();
		}
	});
}

module.exports = app;
