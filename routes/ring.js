// Dependencies
var express = require('express');
var app = express();
var gps = require('gps2zip');
var zipcodes = require('zipcodes');
var glog = require('../glog.js')('ring');
var db = require('../dbexecute');
var locationUtils = require('../Utilities/locationUtils');
var mysql = require('mysql');
var authenticate = require('../servicesAuthenticate')
var statusCodes = require('../Utilities/StatusCodesBackend');
var Constants = require('../Utilities/Constants');

//-------------------------START-----------------------------------------------------

// GET: pull all ring locations and details near the user, sorted by distance from given lat and long
// Ex: /api/ring?latitude='+lat +'&longitude=' + long
app.get('/', function(req,res){
     authenticate.checkAuthentication(req, res, function (data) {
        /*
        Latitude and Longitude of user comes from front end and passed in as query params of this http GET request
        For website - browser can get user's coordiates --> Example: http://www.w3schools.com/html/html5_geolocation.asp
        For Android/IOS - use mobiles geolocation api to get user's coordinates and pass to this api
        */
        var userLat = req.query.latitude;
        var userLong = req.query.longitude;
        locationUtils.getRingsNearLocation(userLat, userLong, Constants.FIND_RINGS_DEFAULT_RADIUS, res, function(result){
            var sortedRings = locationUtils.getSortedObjectsByAddress(result.data, userLat, userLong);
            result.data = sortedRings;
            res.send(result);
            
        });

    });
});
//-------------------------END-------------------------------------------------------


//------------------------START-----------------------------------------------------
// GET: get an object containing the rings a user is a part of
// Ex: /api/ring/subscribedRings
app.get('/subscribedRings', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
            var userId = req.user.userId;
            var sql = "SELECT R.name, R.ringId FROM tblRing R WHERE R.ringId IN (SELECT RU.ringId FROM tblRingUser RU WHERE RU.userId = ?);";
            var inserts = [userId];
            sql = mysql.format(sql,inserts);
            db.dbExecuteQuery(sql, res, function(result){
                if(result.data.length == 0){
                    // No data retreieved
                    result.status = statusCodes.USER_NOT_SUBSCRIBED_TO_RINGS;
                    result.description = "No rings that this user is part of.";
                    res.send(result);
                } else {
                    if(result.status==statusCodes.EXECUTED_QUERY_SUCCESS){
                        // Overwrite status and description
                        result.status=statusCodes.RECIEVED_SUBSCRIBED_RINGS_SUCCESS;
                        result.description="Got ring names for userId: "+userId;
                    } 
                    res.send(result);
                }
             });
    });
});
//-------------------------END------------------------------------------------------

//-------------------------START-----------------------------------------------------
// TODO: add promises?
// TODO: if no rings show a map - rings near them - for the person to join and say that the user is in no rings

/*Get rings a user is part of (leads or is in as a member of the ring) */

app.get('/subscribedRings', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        var sql = 'SELECT * FROM tblRing WHERE ringId IN ( SELECT ringId FROM tblRingUser WHERE userId = ? )';
        var inserts = [req.user.userId];
        sql = mysql.format(sql, inserts);

        db.dbExecuteQuery(sql, res, function(result) {
            res.json(result)
        });
        
    });
});

//-------------------------END-------------------------------------------------------



//-------------------------START-----------------------------------------------------
// POST - Create ring
app.post('/', function(req, res){
    authenticate.checkAuthentication(req, res, function(data) {
        var userId = req.user.userId; 
        var ringName = req.body.name;
        var ringAddr = req.body.addr;
        var ringCity = req.body.city;
        var ringState = req.body.state;
        var ringZipcode = req.body.zipcode;
        var ringLat = req.body.latitude;
        var ringLong = req.body.longitude;
        var ringStatus = 1;
        var createdBy = userId;
       
        // Check how many rings this user already has created
        var sql = "SELECT COUNT(*) as count FROM tblRing WHERE createdBy = ?";
        var inserts = [userId];
        sql = mysql.format(sql, inserts);
        
        db.dbExecuteQuery(sql, res, function(result){
            if(result.status == statusCodes.EXECUTED_QUERY_SUCCESS){
                if(result.data[0].count >= Constants.NUMBER_OF_CREATED_RINGS_ALLOWED){
                    result.status = statusCodes.NUMBER_OF_CREATED_RINGS_EXCEEDED_LIMIT;
                    result.description = "This user has reached the limits of how many rings they can create.";
                    result.data = null;
                    res.send(result);
                } else {
                    createRing();
                }
            }
        });
        
        var createRing = function (){
            var sql = "INSERT INTO tblRing (name, addr, city, state, zipcode, latitude, longitude, ringStatus, createdBy, createdOn) VALUES "+
                        "(?,?,?,?,?,?,?,?,?, NOW());";
            var inserts = [ringName, ringAddr, ringCity, ringState, ringZipcode, ringLat, ringLong, ringStatus, createdBy];
            sql = mysql.format(sql, inserts);
            
            db.dbExecuteQuery(sql, res, function(result){
                if(result.status == statusCodes.EXECUTED_QUERY_SUCCESS){
                    insertUserIntoRingUserTable();
                }
            });
            
            var insertUserIntoRingUserTable = function(){
                // Get the ring ID of the ring just inserted
                var ringIdSql = "SELECT ringId FROM tblRing WHERE NAME=?";
                ringIdSql = mysql.format(ringIdSql, [ringName]);
                
                db.dbExecuteQuery(ringIdSql, res, function(ringIdResult){
                    if(ringIdResult.status == statusCodes.EXECUTED_QUERY_SUCCESS){
                        var ringUserSql =  "INSERT INTO tblRingUser (ringId, userId, roleId, status, joinedOn) VALUES (?,?,?,?,NOW());"; 
                        var ringUserInserts = [ringIdResult.data[0].ringId, userId, 0, 1];
                        ringUserSql = mysql.format(ringUserSql, ringUserInserts);
                        
                        db.dbExecuteQuery(ringUserSql, res, function(ringUserResult){
                            if(ringUserResult.status == statusCodes.EXECUTED_QUERY_SUCCESS){
                                ringUserResult.status = statusCodes.CREATE_RING_SUCCESS;
                                ringUserResult.description = "Successfully created ring created by userId " + createdBy;
                                ringUserResult.data = null;
                            }
                            res.send(ringUserResult);
                        });
                    }
                });;
                
            };
        }
       
    });
});
//-------------------------END-------------------------------------------------------

app.delete('/', function(req, res) {
    authenticate.checkAuthentication(req, res, function(data) {
        var ringId = req.query.ringId;

        if (!ringId) {
            glog.error('Missing ring id');
            return res.json({
                status: statusCodes.DELETE_USER_REQUEST_FAIL,
                description: 'The ringId field was missing.'
            })
        }

        // Set status to 0 ?
        // TODO what do i update tblRingUser status to? need clarification
        var sql = 'UPDATE tblRing SET ringStatus = ? WHERE ringId = ? and createdBy = ?';
        var values = [0, ringId, req.user.userId];
        sql = mysql.format(sql, values);

        db.dbExecuteQuery(sql, res, function(result) {
            if (result.data.affectedRows === 1) {
                result.status = statusCodes.DELETE_RING_SUCCESS;
                result.description = 'Successfully delete ringId: ' + ringId;
            } else {
                // TODO - how to check if there is a ring for this user before updating/deleting?
                glog.error('Could not delete ringId: ' + ringId);
                result.status = statusCodes.DELETE_RING_FAIL;
                result.description = 'Not authorized to delete this ring.'
            }
            res.json(result);
        });
    })
});

//-------------------------START-----------------------------------------------------
// POST: request to join the ring
// ex: /api/ring/join/234
app.post('/join/:ringId', function(req,res){
    authenticate.checkAuthentication(req, res, function (data) {
        var ringId = req.params.ringId;
        var userId = req.user.userId;
        var userRole = 1; // 0 means leader, 1 means grubbling
        var userStatus = 0; // user status for pending=0, approved=1, declined=2, and banned=3
        
        var sql = null;
        // TODO: need error checking and validation
        
        // TODO: Check if user already has request (0,1,2,3)
    
        // ring status for pending=0, approved=1, declined=2, and banned=3
         sql = "INSERT INTO tblRingUser (ringId, userId, roleId, status, joinedOn) VALUES (?,?,?,?, NOW());";
         var inserts = [ringId, userId, userRole,userStatus];
         sql = mysql.format(sql, inserts);
            
        db.dbExecuteQuery(sql, res, function(result){
            if(result.status == statusCodes.EXECUTED_QUERY_SUCCESS){
                // overwrite status and description
                result.status = statusCodes.REQUEST_TO_JOIN_RING_SUCCESS;
                result.description="Added userId " + userId + " with pending status to ringId " + ringId;
                
            }
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
// EX: /api/ring/join/234/1
app.put('/join/:ringId/:handleRequest', function(req,res){
    authenticate.checkAuthentication(req, res, function (data) {
        var pending = 0;
        var approved = 1;
        var declined = 2;
        var banned = 3;
        
        // TODO: Check if userId is leader of associated ring
        
        // TODO: Logic for changing status to banned if declined too many times
        
        var changeStatusTo = req.params.handleRequest; //boolean
        var userId = req.user.userId;
        var ringId = req.params.ringId;
        var sql = "";
        
        if(changeStatusTo == pending || changeStatusTo == approved || changeStatusTo == declined || changeStatusTo == banned ) {
            sql = "UPDATE tblRingUser R " +
            "SET R.status = ?, R.joinedOn = NOW() " + 
            "WHERE R.userId = ? " +
            "AND R.ringId = ?;";
            var inserts = [changeStatusTo, userId, ringId];
            sql = mysql.format(sql,inserts);
        } else {
            res.send(sql);// TODO: handle error
        }
        db.dbExecuteQuery(sql, res, function(result){
            if(result.status==statusCodes.EXECUTED_QUERY_SUCCESS){
                // Overwrite status and description
                result.status=statusCodes.UPDATE_USER_ACCESS_TO_RING_SUCCESS;
                result.description="Updated userId: "+userId+" to status code: "+changeStatusTo;
            } 
            res.send(result);
        });
    });
});
//-------------------------END-------------------------------------------------------

// Delete: If user uses this delete, and the user has a pending status then the delete removes the record
//          if user uses this with status of approved, then delete removes record  and notifies admin
//          if none of the above, do nothing
// Ex: /api/ring/join/234
app.delete('/join/:ringId', function(req,res){
    authenticate.checkAuthentication(req, res, function (data) {
        var pending = 0;
        var approved = 1;
        var declined = 2;
        var banned = 3;
        
        var userId = req.user.userId;
        var ringId = req.params.ringId;
        
        
        // Check if user has pending or approved status for joining a ring
        var statusSql = "SELECT status FROM tblRingUser WHERE ringId=? AND userId=?;";
        var inserts = [ringId, userId];
        
        statusSql = mysql.format(statusSql, inserts);
        
        db.dbExecuteQuery(statusSql, res, function(statusResult){
            
            if(statusResult.status==statusCodes.EXECUTED_QUERY_SUCCESS){
                
                if(statusResult.data.length == 0){
                    
                    // No data retreieved
                    statusResult.status = statusCodes.NO_PENDING_USER_REQUESTS;
                    statusResult.description = "No approved or pending requests retrieved for this user id and ring id.";
                    res.send(statusResult);
                     
                } else {
                    
                   // If pending or approved status, then delete request
                    if(statusResult.data[0].status == pending || statusResult.data[0].status == approved){
                        // TODO: confirm delete query (where clause)
                        var deleteSql = "DELETE FROM tblRingUser WHERE ringId=? AND userId=?";
                        inserts = [ringId, userId];
                        deleteSql = mysql.format(deleteSql, inserts);
                        
                        db.dbExecuteQuery(deleteSql, res, function(deleteResult) {
                            if(deleteResult.status == statusCodes.EXECUTED_QUERY_SUCCESS){
                                deleteResult.status = statusCodes.DELETE_USER_REQUEST_SUCCESS;
                                deleteResult.description = "Successfully deleted ring request.";
                                res.send(deleteResult);
                            }
                        });
                    } else {
                        statusResult.status = statusCodes.DELETE_USER_REQUEST_FAIL;
                        statusResult.description = "Unsuccessful attempt at deleting request from records.";
                        res.send(statusResult);
                    }
                }
            }
        });
        
    });
});

//-------------------------START-----------------------------------------------------
// GET: leader get notification if someone is trying join ring
// Ex: /api/ring/notifyLeader
app.get('/notifyLeader', function(req,res){
    authenticate.checkAuthentication(req, res, function (data) {
        var leaderId = req.user.userId;
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


//-----------------------Helper Functions--------------------------------------------


// Function: returns pending status entries from tblRingUser associated with given ringIds
// Parameters: ringIds - array containing ring ids
//             callback - callback function contains the returned results.  Needed for asynchronous execution
var getPendingUsersFromRingIds = function(ringIds,res, callback){
    var sql=null;
    
    // Check if there are any rings in the array
    if(ringIds.length == 0){
        callback({status:statusCodes.USER_NOT_LEADER_TO_ANY_RINGS, description:"There are no active rings that this user is a leader of.", data:null});
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
                result.status=statusCodes.NO_PENDING_USER_REQUESTS;
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