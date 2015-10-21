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
        var queryParamZipcodeList = zipcodesNearUser.toString().split(',').join(" OR zipcode = ");
    
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
        
        // execute first sql to see if key is a ringId or ring name (partial or full)
        ringSql = "SELECT * FROM tblRing R "+
            "WHERE (R.ringId=? "+
                "OR R.name LIKE ?) "+
            "AND R.ringStatus = 1;";
        var inserts = [key, key+"%"];
        ringSql = mysql.format(ringSql, inserts);
        // connect to db and execute sql
        db.dbExecuteQuery(ringSql,res, function(ringResult){
            // execute second sql to see if key is leaderId or leader's name
            leaderSql = "SELECT * FROM tblRing R "+
            "INNER JOIN tblUser U "+
            "ON R.createdBy=U.userId "+
            "WHERE (U.username LIKE ? "+
                "OR U.firstName LIKE ? "+
                "OR U.lastName LIKE ?) "+
            "AND R.ringStatus = 1;";
            inserts = [key +"%", key+"%", key+"%"];
            leaderSql = mysql.format(leaderSql, inserts);
            // connect and execute
            db.dbExecuteQuery(leaderSql,res, function(leaderResult){
                if(leaderResult.data.length ==0 && ringResult.data.length == 0){
                    description = "Could not match the search criteria with anything in our database.";
                }
                else{
                    description = "Returned matching searches";
                }
                var data = {'status':'Success', 'description':description, 'data':{'rings':ringResult.data, 'leaders':leaderResult.data}};
                res.send(data);
            });
        });
     
    /*   
        sql = "SELECT * FROM tblRing R "+
            "INNER JOIN tblUser U "+
            "ON R.createdBy=U.userId "+
            "WHERE ((R.ringId LIKE ? "+
                "OR U.username LIKE ? "+
                "OR R.name LIKE ?) "+
            "AND R.ringStatus = 1);";
                
        var inserts = [key + "%", key + "%", key + "%"];
        sql = mysql.format(sql,inserts);
    */    
        
        // TODO: need error checking
    /*  
        // ex: leaderName/brandon-barooah
        if(req.params.field == 'leaderName'){
            // if no dash found see if they're searching for first name or last name
            if(req.params.key.indexOf('-') === -1)
            {
                sql = "SELECT * FROM tblRing R "+
                "INNER JOIN tblUser U "+
                "ON R.createdBy=U.userId "+
                "WHERE (U.firstName LIKE ? "+
                "OR U.lastName LIKE ?) " +
                "AND R.ringStatus=1;"; 
                var inserts=[req.params.key+"%", req.params.key+"%"];
                sql = mysql.format(sql,inserts);
            
            }
            else{ // a full first or last name was given seperated by a '-'
                var fullEntry = req.params.key.split('-');
                var firstEntry = fullEntry[0];   // this should be a full first OR last name
                var secondEntry = fullEntry[1]; // this CAN be partially filled out since it is wildcard search
                
                sql = "SELECT * FROM tblRing R "+
                "INNER JOIN tblUser U "+
                "ON R.createdBy=U.userId "+
                "WHERE "+
                "(U.firstName=? OR U.lastName=?) "+
                "AND "+
                "(U.firstName LIKE ? OR U.lastName LIKE ?) " +
                "AND "+
                "R.ringStatus=1;";
                var inserts=[firstEntry,firstEntry,secondEntry+"%",secondEntry+"%"];
                sql = mysql.format(sql,inserts);
    
            }
            
            description = "Get ring details for ring leader's name: " + req.params.key + "*";
        } 
        else if(req.params.field == 'ringId'){
            sql = "SELECT * FROM tblRing R " +
            "WHERE R.ringId = ? "+
            "AND R.ringStatus=1;";
            var inserts=[req.params.key];
            sql = mysql.format(sql,inserts);
            
            description = "Get ring details for ringId: " + req.params.key;
    
        }
        else if(req.params.field == 'username'){
            sql = "SELECT * FROM tblRing R, tblUser U " +
            "WHERE R.createdBy = U.userId "+
            "AND U.username LIKE ? "+
            "AND R.ringStatus=1;";
            var inserts=[req.params.key+"%"];
            sql = mysql.format(sql,inserts);
            
            description = "Get ring details for ring leader's username: " + req.params.key;
    
        }
        else if(req.params.field == 'ringName'){
            sql = "SELECT * FROM tblRing R " +
            "WHERE R.name LIKE '" + req.params.key + "%' "+
            "AND R.ringStatus=1;";
            var inserts=[req.params.key+"%"];
            sql = mysql.format(sql,inserts);
    
            description = "Get ring details for ring name: " + req.params.key;
        }
    
    */
    /*
        // connect to db and execute sql
        db.dbExecuteQuery(sql,res, function(result){
            if(result.data.length == 0){
                // overwrite description
                result.description="Could not match the search criteria with anything in our database.";
            }
            res.send(result);
        });
    */
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
