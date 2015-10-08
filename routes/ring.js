// Dependencies
var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;
var gps = require('gps2zip');
var zipcodes = require('zipcodes');
var debug = require('debug')('grubbring:ring');

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

// GET: pull all ring locations and details near the user
//      if no rings found, send error code
app.get('/', function(req,res){
    /*
    Latitude and Longitude of user comes from front end and passed in the body of this http GET request
    For website - browser can get user's coordiates --> Example: http://www.w3schools.com/html/html5_geolocation.asp
    For Android/IOS - use mobiles geolocation api to get user's coordinates and pass to this api
    */
    // var userLat = req.body.latitude;
    // var userLong = req.body.longitude;
    var userLat = 40.926063899999995; //for testing 
    var userLong = -74.1047229; //for testing
    
    //get user zipcode based on lat and log
    var userZipCode = gps.gps2zip(userLat, userLong).zip_code; // --> returns zipcode 07410 for Fair Lawn, NJ
    //find zipcodes within a certain radius (1 mile) of user's zipcode
    var zipcodesNearUser = zipcodes.radius(userZipCode, 1);
    var queryParamZipcodeList = zipcodesNearUser.toString().split(',').join(" OR zipcode = ");

    var query = "SELECT * FROM tblRing WHERE zipcode = "+queryParamZipcodeList+";";   
        debug(query);
        dbExecuteQuery(query, function(err, result){
            if(result.status != "error" && !err){
                // overwrite description
                result.description="Returned all rings";
            }
            res.send(result);
        });
 

    // if(req.query.scope == "all"){
    //     var query = "SELECT * FROM tblRing WHERE zipcode = "+queryParamZipcodeList+" ;";   
    //     console.log(query);
    //     dbExecuteQuery(query, function(err, result){
    //         if(result.status != "error" && !err){
    //             // overwrite description
    //             result.description="Returned all rings";
    //         }
    //         res.send(result);
    //     });
    // }
    // else{
    //     res.send("try using option ?scope=all");
    // }
});
//-------------------------END-------------------------------------------------------


//-------------------------START-----------------------------------------------------
// POST: request to join the ring
// ex: https://grubbring-api-barooah93.c9.io/api/ring/join/234/429
app.post('/join/:ringId/:userId', function(req,res){
    
    var ringId = req.params.ringId;
    var userId = req.params.userId;
    var userRole = 1; // 0 means leader, 1 means grubbling
    var userStatus = 0; // user status for pending=0, approved=1, declined=2, and banned=3
    
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

    query = "INSERT INTO tblRingUser (ringId, userId, roleId, status) "+
    "VALUES ("+ringId+", "+userId+", "+ userRole+", "+userStatus+");"
        
    dbExecuteQuery(query, function(err, result){
        if(result.status != "error" && !err){
            // overwrite description
            result.description="Added userId " + userId + " with pending status to ringId " + ringId;
        }
        res.send(result);
    });
    
});
//-------------------------END-------------------------------------------------------


//-------------------------START-----------------------------------------------------
// GET: leader get notification if someone is trying join ring
app.get('/notifyLeader/:userId', function(req,res){
    var leaderId = req.params.userId;
    var ringIds=[];
    var query=null;
    
    //TODO: Validate userId
          
    // First get the ringids that are associated with this userId
    query = "SELECT ringId FROM tblRingUser WHERE userId="+leaderId+" AND roleId=0 AND status=1;";
    dbExecuteQuery(query,function(err, result){
        if(result.status != "error" && !err){
            
            // push ring ids that this user owns to the ringIds array
            for(var i=0; i<result.data.length; i++){
                ringIds.push(result.data[i].ringId);
            }
            // Get any users that have pending status and are associated with the ring/s
            getPendingUsersFromRingIds(ringIds, function(err,result){
                res.send(result);
            });

        }
        else{
            res.send(result);
        }
    });
        

});
//-------------------------END-------------------------------------------------------




//-------------------------START-----------------------------------------------------
// PUT: ring leader accepts or rejects user's request.
//          service will also notify user of ring leader's decision

//assuming 1 = approved, 0 = banned, 2 = pending?
app.put('/join/:userId/:ringId/:handleRequest', function(req,res){
    var accepted = req.params.handleRequest; //boolean
    var userId = req.params.userId;
    var ringId = req.params.ringId;
    var query = "";
    var description = "";
    
    if(accepted == 1) {
        query = "UPDATE tblRingUser R " +
        "SET R.status = 1 " +
        "WHERE R.userId = " + userId + " " +
        "AND R.ringId = " + ringId + ";"
        description = "Accepted userId " + userId + "'s request to join ring"
    } else if (accepted == 0) {
        query = "UPDATE tblRingUser R " + 
        "SET R.status = 0 " +
        "WHERE R.userId = " + userId + " " +
        "AND R.ringId = " + ringId + ";"
        description = "Rejected userId " + userId + "'s request to join ring"
    } else {
        return; //bad query - handle later
    }
    dbExecuteQuery(query, function(err, callback){
         if(callback.status != "error" && !err){
            if(callback.data.length == 0){
                // overwrite description
                callback.description="Could not match the search criteria with anything in our database.";
            }
            else{
                callback.description=description;
            }
        }
        res.send(callback);
    });
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
        
        description = "Get ring details for ring leader's name: " + req.params.key + "*";

       
    }
    else if(req.params.field == 'ringId'){
        query = "SELECT * FROM tblRing R " +
        "WHERE R.ringId = '" + req.params.key + "' "+
        "AND R.ringStatus=1;";

        res.send(query);

        description = "Get ring details for ringId: " + req.params.key;

    }
    else if(req.params.field == 'username'){
        query = "SELECT * FROM tblRing R, tblUser U " +
        "WHERE R.createdBy = U.userId "+
        "AND U.username LIKE '" + req.params.key + "%' "+
        "AND R.ringStatus=1;";

        res.send(query);
        description = "Get ring details for ring leader's username: " + req.params.key;

    }
    else if(req.params.field == 'ringName'){
        query = "SELECT * FROM tblRing R " +
        "WHERE R.name LIKE '" + req.params.key + "%' "+
        "AND R.ringStatus=1;";

        res.send(query);
    }
    
    var query = "SELECT * FROM tblUser;";   
        description = "Get ring details for ring name: " + req.params.key;
    }
    

    // connect to db and execute query
    dbExecuteQuery(query, function(err, result){
        if(result.status != "error" && !err){
            if(result.data.length == 0){
                // overwrite description
                result.description="Could not match the search criteria with anything in our database.";
            }
            else{
                result.description=description;
            }
        }
        res.send(result);
    });
   
});
//-------------------------END-------------------------------------------------------


//-----------------------Helper Functions--------------------------------------------

// Function: Establish connection to database and execute the given query
// Parameters: query - string containing sql query to be executed
//             callback - function to return resultset when completed execution
/* Returns object with format: {status:'', description:'', data:''}
     Status - either 'error' or 'success'
     Description - description of status
     Data - the rows of the resultset (null if update, delete, etc) if success, detailed error otherwise
*/ 
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

   
});
//-------------------------END-------------------------------------------------------

};


// Function: returns pending status entries from tblRingUser associated with given ringIds
// Parameters: ringIds - array containing ring ids
//             callback - callback function contains the returned results.  Needed for asynchronous execution
var getPendingUsersFromRingIds = function(ringIds, callback){
    var query=null;
    
    // Check if there are any rings in the array
    if(ringIds.length == 0){
        callback(null,{status:"success", description:"There are no active rings that this user is a leader of.", data:null});
    }
    else{
        // Now check if other userIds associated with those rings have a pending status
        query="SELECT * FROM tblRingUser RU "+
        "INNER JOIN tblUser U "+
        "ON RU.userId=U.userId "+
        "WHERE RU.status=0 AND (";
        
        // Concatenate sql statement if there is more than 1 ring to deal with
        for(var i=0; i<ringIds.length; i++){
            query+= "RU.ringId="+ringIds[i]+" OR ";
        }
        // eliminate the extra 'OR ' and finish the sql statment
        query = query.substring(0,query.length - 4) + ");";
        // connect to db and execute query
        dbExecuteQuery(query,function(err, result){
            if(result.status != "error" && !err){
                if(result.data.length == 0){
                    result.description = "There are no pending users.";
                }
                else{
                    // overwrite description
                    result.description = "Retrieved pending users for given rings.";
                }
                callback(null, result);
            }
            else{
                callback(err, result);
            }
        });
    }
};



module.exports = app;
