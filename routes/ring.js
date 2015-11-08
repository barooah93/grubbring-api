// Dependencies
var express = require('express');
var app = express();
var gps = require('gps2zip');
var zipcodes = require('zipcodes');
var glog = require('../glog.js')('ring');
var db = require('../dbexecute');
var mysql = require('mysql');
var authenticate = require('../servicesAuthenticate')

//-------------------------START-----------------------------------------------------

// GET: pull all ring locations and details near the user
//      if no rings found, send error code
app.get('/', function(req,res){
     authenticate.checkAuthentication(req, res, function (data) {
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
        var queryParamZipcodeList = zipcodesNearUser[0].toString();
    
        var sql = "SELECT * FROM tblRing WHERE zipcode = ?;"; 
        var inserts = [queryParamZipcodeList];
        sql = mysql.format(sql, inserts);
        glog.log(sql);
        db.dbExecuteQuery(sql, res, function(result){
            // overwrite description
            result.description="Returned all rings";
            res.send(result);
        });
     });
});
//-------------------------END-------------------------------------------------------

//-------------------------START-----------------------------------------------------
// TODO: sort - put most active rings at the top
// TODO: if no rings show a map - rings near them - for the person to join and say that the user is in no rings

/*Get rings a user is part of (leads or is in as a member of the ring) */
app.get('/subscribedRings/:userId', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        var userId = req.params.userId;
        var sql = null;
        
         sql = "SELECT * FROM tblRingUser RU, tblRing R WHERE RU.ringId = R.ringId AND RU.userId = ?;"
         var inserts = [userId];
         sql = mysql.format(sql, inserts);
        
        db.dbExecuteQuery(sql, res, function(result){
            // overwrite description
            result.description="Got rings user with userId " + userId + " is a part of";
            res.send(result);
        });
    });
});
    
//-------------------------END-------------------------------------------------------

//-------------------------START-----------------------------------------------------
// TODO: sort - put most active rings at the top

//statusId 0: no order = 0, in progress = 1, completed= 2
app.get('/getActivityCount/:ringId', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        var ringId = req.params.ringId;
        var sql = null;
        
        //get number of activities in last 5 days
        sql = "SELECT O.ringId, COUNT(*) AS count FROM tblOrder O, tblOrderStatus OS WHERE O.orderId = OS.orderId AND O.ringId = " + ringId + " AND OS.statusId = 2 AND OS.enteredOn >= DATE_SUB(CURDATE(), INTERVAL 5 DAY) AND OS.enteredOn <= CURDATE();";
        db.dbExecuteQuery(sql, res, function(result){
            // overwrite description
            result.description = "Got activity count for ringId: " + ringId;
            res.send(result);
        });
    });
        /* Sort the rings by most activities*/
});
    
//-------------------------END-------------------------------------------------------


//-------------------------START-----------------------------------------------------
// POST: request to join the ring
// ex: https://grubbring-api-barooah93.c9.io/api/ring/join/234/429
app.post('/join/:ringId/:userId', function(req,res){
    authenticate.checkAuthentication(req, res, function (data) {
        var ringId = req.params.ringId;
        var userId = req.params.userId;
        var userRole = 1; // 0 means leader, 1 means grubbling
        var userStatus = 0; // user status for pending=0, approved=1, declined=2, and banned=3
        
        var sql = null;
        // TODO: need error checking and validation
        
    
        // ring status for pending=0, approved=1, declined=2, and banned=3
         sql = "INSERT INTO tblRingUser (ringId, userId, roleId, status) VALUES (?,?,?,?);"
         var inserts = [ringId, userId, userRole,userStatus];
         sql = mysql.format(sql, inserts);
            
        db.dbExecuteQuery(sql, res, function(result){
            // overwrite description
            result.description="Added userId " + userId + " with pending status to ringId " + ringId;
            res.send(result);
        });
    
    // TODO: notify ring leader in charge of ringId
    });
});
//-------------------------END-------------------------------------------------------

//-------------------------START-----------------------------------------------------
// PUT: ring leader accepts or rejects user's request.
//          service will also notify user of ring leader's decision

//assuming pending = 0, approved = 1, declined = 2, banned = 3
app.put('/join/:ringId/:userId/:handleRequest', function(req,res){
    authenticate.checkAuthentication(req, res, function (data) {
        var pending = 0;
        var approved = 1;
        var declined = 2;
        var banned = 3;
        
        var changeStatusTo = req.params.handleRequest; //boolean
        var userId = req.params.userId;
        var ringId = req.params.ringId;
        var sql = "";
        
        if(changeStatusTo == pending || changeStatusTo == approved || changeStatusTo == declined || changeStatusTo == banned ) {
            sql = "UPDATE tblRingUser R " +
            "SET R.status = ? " + 
            "WHERE R.userId = ? " +
            "AND R.ringId = ?;";
            var inserts = [changeStatusTo, userId, ringId];
            sql = mysql.format(sql,inserts);
        } else {
            res.send(sql);// TODO: handle error
        }
        db.dbExecuteQuery(sql, res, function(result){
            result.description="Updated userId: "+userId+" to status code: "+changeStatusTo;
            res.send(result);
        });
    });
});
//-------------------------END-------------------------------------------------------


//-------------------------START-----------------------------------------------------
// GET: leader get notification if someone is trying join ring
app.get('/notifyLeader/:userId', function(req,res){
    authenticate.checkAuthentication(req, res, function (data) {
        var leaderId = req.params.userId;
        var ringIds=[];
        var sql=null;
        
        //TODO: Validate userId
        
        // First get the ringids that are associated with this userId
        sql = "SELECT ringId FROM tblRingUser WHERE userId=? AND roleId=0 AND status=1;"
        var inserts = [leaderId];
        sql = mysql.format(sql, inserts);
        db.dbExecuteQuery(sql, res, function(result){
            // push ring ids that this user owns to the ringIds array
            for(var i=0; i<result.data.length; i++){
                ringIds.push(result.data[i].ringId);
            }
            // Get any users that have pending status and are associated with the ring/s
            getPendingUsersFromRingIds(ringIds, res, function(result){
                res.send(result);
            });
        });
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
// ex: https://grubbring-api-barooah93.c9.io/api/ring/search/leaderName/my%20home%20ring
// wildcard search
// TODO: tokenize spaces/ url encoding. Use sql 'in'
app.get('/search/:key', function(req,res) {
    authenticate.checkAuthentication(req, res, function (data) {
        var ringSql = null; // sql statement to find key in ringIds or ring names
        var leaderSql = null; // sql statement to find key in leaderId or leader name
        var description = "";
        var key = req.params.key; // is already url decoded
        var tokenized = [];
        var firstName = null;
        var lastName = null;
        var tokenizedSearch="";
        var inserts =[];

        // tokenize key for multiple word search
        tokenized = key.split(" ");
        inserts = [key,"%"+key+"%"];
         
        // check if there are multiple words in key
        if(tokenized.length<2){
            tokenized[1]=""; // add blank string to second index if there is only one word in key so it is defined
        }
        else{ // tokenize the search to look for each word in ring name
            tokenizedSearch = "OR ( ";
            for(var i=0;i<tokenized.length;i++){
                // check if last word in key
                if(i == tokenized.length-1) {
                    tokenizedSearch += "R.name LIKE ?)";
                }
                else{
                    tokenizedSearch += "R.name LIKE ? AND "
                }
                inserts.push("%"+tokenized[i]+"%");
            }
        }
        
        // execute first sql to see if key is a ringId or ring name (partial or full)
        ringSql = "SELECT * FROM tblRing R WHERE ((R.ringId=? OR R.name LIKE ? "+tokenizedSearch+") AND R.ringStatus=1) ;";
        
        ringSql = mysql.format(ringSql, inserts);
        
        // execute first sql to see if key is a ringId or ring name (partial or full)
        // connect to db and execute sql
        db.dbExecuteQuery(ringSql,res, function(ringResult){
            // execute second sql to see if key is leaderId or leader's name
            leaderSql = "SELECT * FROM tblRing R "+
            "INNER JOIN tblUser U "+
            "ON R.createdBy=U.userId "+
            "WHERE (U.username LIKE ? "+
                "OR (U.firstName LIKE ? AND U.lastName LIKE ?) "+
                "OR (U.lastName LIKE ? AND U.firstName LIKE ?)) "+
            "AND R.ringStatus = 1;";
            inserts = ["%"+key +"%", "%"+tokenized[0]+"%", "%"+tokenized[1]+"%","%"+tokenized[0]+"%", "%"+tokenized[1]+"%"];
            leaderSql = mysql.format(leaderSql, inserts);
            
//          connect and execute
            db.dbExecuteQuery(leaderSql,res, function(leaderResult){
                if(leaderResult.data.length ==0 && ringResult.data.length == 0){
                    description = "Could not match the search criteria with anything in our database.";
                }
                else{
                    description = "Returned matching searches";
                }
                var data = {
                    status:'Success', 
                    description: description, 
                    data: {
                        rings:ringResult.data,
                        leaders:leaderResult.data
                    }
                };
                res.send(data);
            });
        });
     

    });
});
//-------------------------END-------------------------------------------------------


//-----------------------Helper Functions--------------------------------------------


// Function: returns pending status entries from tblRingUser associated with given ringIds
// Parameters: ringIds - array containing ring ids
//             callback - callback function contains the returned results.  Needed for asynchronous execution
var getPendingUsersFromRingIds = function(ringIds,res, callback){
    var sql=null;
    
    // Check if there are any rings in the array
    if(ringIds.length == 0){
        callback({status:"success", description:"There are no active rings that this user is a leader of.", data:null});
    }
    else{
        // Now check if other userIds associated with those rings have a pending status
        sql="SELECT * FROM tblRingUser RU "+
        "INNER JOIN tblUser U "+
        "ON RU.userId=U.userId "+
        "WHERE RU.status=0 AND (";
        
        var inserts =[];
        
        // Concatenate sql statement if there is more than 1 ring to deal with
        for(var i=0; i<ringIds.length; i++){
            sql+= "RU.ringId = ? OR ";
            inserts = [ringIds[i]];
            sql = mysql.format(sql,inserts);
        }
        // eliminate the extra 'OR ' and finish the sql statment
        sql = sql.substring(0,sql.length - 4) + ");";
        // connect to db and execute sql
        db.dbExecuteQuery(sql,res,function(result){
            if(result.data.length == 0){
                result.description = "There are no pending users.";
            }
            else{
                // overwrite description
                result.description = "Retrieved pending users for given rings.";
            }
            callback(result);
           
        });
    }
};



module.exports = app;
