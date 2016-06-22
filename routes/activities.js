var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;
var async = require('async');
var glog = require('../glog.js')('activity');
var db = require('../dbexecute');
var auth = require('../servicesAuthenticate');
var mysql = require('mysql');
var statusCodes = require('../Utilities/StatusCodesBackend');

/** variables **/
var user;

/**
 * Activities API Overview:
1. GET A list of activities (both active and expired) that the user either initiated or was a part of
2. POST Create activity where user will create order activity for certain ring
3. GET Search activities - allows you to search current and expired activites that user initiated or was a part of
4. GET View a specific activity's details by clicking on the activity panel on the screen
5. POST Delete an activity
6. POST Update an activities info

TODO:
1)refractor code to only allow user to acces HIS activities, rings, etc 
2) add status codes
3) Refactor the url - how we pass in the parameters - dont pass a user id obvi ;000
4) go on google docs and add status codes

   **/

//Gets a list of the activities (both active and expired) that the user initiated or was a part of. List will be from most active to least active
//FIELDS: ActivityId, Ring name, bringerId, max number of orders, remaining number of orders (indicates whether an activity is open or closed, with the "I'm IN!" button), and the last activity date/time

//TODO: add status code, logging error handling
app.get('/', function(req,res){
	var userId;	// user's ID
	// check authentication of user
	auth.checkAuthentication(req,res, function(data){
		// retrieve userId
		userId = req.user.userId; 
		
		/*TODO: check last ordertime > current order time*/
			var activitiesSql = "SELECT A.ringId, A.activityId, U.firstName, U.lastName, A.maxNumOrders, A.lastOrderDateTime, G.name as grubberyName, "+
					"G.addr as grubberyAddress, G.city as grubberyCity, (A.maxNumOrders-SUM(A.activityId)) as remainingOrders "+
					"FROM tblUser U, tblGrubbery G, tblActivity A " +
					"WHERE A.ringId IN (SELECT ringId FROM tblRingUser WHERE userId=? AND status=1) AND " +
					"A.grubberyId = G.grubberyId AND " +
					"U.userId = A.bringerUserId "+
					"GROUP BY A.activityId;";
			var inserts = [userId];
	    	activitiesSql = mysql.format(activitiesSql, inserts);

			db.dbExecuteQuery(activitiesSql, res, function(result){
				var resultObject; // resulting object
				var status = "";
				var description;
				var data;
				
				if(result.data.length > 0){
					status="status code"
					description = "Successfully pulled all activities associated with this user.";
					
					glog.log("Activities.js: Retrieved a list of activities (ordered by most active to least active) " +
					"for userId " + userId + " that are active/expired which this user was a part of.");
				}
				else{
					status="status code"
					description = "No activities are associated with this user.";
					
					glog.log("Activities.js: No activities are associated with userId " + userId);
				}
				resultObject = {
					status: status,
					description: description,
					data: result.data
				};
				res.send(resultObject);
			});
	    });
});

//-------------------------START--------------------------------------------------
// DELETE: delete an activity
app.delete('/deleteActivity/:activityId', function(req,res) {
	auth.checkAuthentication(req, res, function (data) {
		var sql = null;
		var activityId = req.params.key;
		var userId = req.user.userId;
				
		if(activityId.isNaN) {
			glog.error("Activities.js: Not a valid activityId to deleteActivity");
		} else {
			
			// TODO: Delete all orders associated with this activity (physical)
			
			//TODO: error checking - should we have a separate query to see if the user is allowed to delete the activity - 
			//should we show the error message or not***
			
			sql = "DELETE FROM tblActivity A " + 
			"WHERE A.activityId = ? " + 
			"AND A.bringerUserId = ?;"; //TODO: why does the bringeruserid the one that owns the ring??
			var inserts = [activityId, userId];
		    sql = mysql.format(sql, inserts);
			
			db.dbExecuteQuery(sql, res, function(deleteActivityResult){
		        deleteActivityResult.description="Deleted activity for activityId " + activityId;
		        
		        res.send(deleteActivityResult);
		        
		        glog.log(deleteActivityResult.description);
		    });
		}
		
	});
});

//-------------------------------START-----------------------------------------------
//POST: update an activity's info
app.post('/updateActivity/:activityId', function(req,res) { //assuming the grubbringer can be anyone
	/*maxorders
	lastorderdatetime
	bringeruserid???*/
	
	auth.checkAuthentication(req, res, function (data) {
		var sql = null;
		var userId = req.user.userId;
		
		var activityId = req.params.activityId;
		var maxNumOrders = req.body.maxNumOrders;
		var lastOrderDateTime = req.body.lastOrderDateTime;
//		var bringerUserId = req.body.bringerUserId;		**Future enhancement
		
		var isMoreThanOneUpdate = false;
		var inserts = [];
		
		sql = "UPDATE tblActivity A " + 
		"SET "; 
		
		if(maxNumOrders != null) {
			sql += "A.maxNumOrders = ?";
			isMoreThanOneUpdate = true;
			inserts.push(maxNumOrders);
		}
		if(lastOrderDateTime != null) {
			if(isMoreThanOneUpdate) {
				sql += ",";
			}
			sql += "A.lastOrderDateTime = ?";
			isMoreThanOneUpdate = true;
			inserts.push(lastOrderDateTime);
		}
		// if(bringerUserId != null) {
		// 	if(isMoreThanOneUpdate) {
		// 		sql += ",";
		// 	}
		// 	sql += "A.bringerUserId = ?";
		// 	isMoreThanOneUpdate = true;
		// 	inserts.push(bringerUserId);
		// }
		
		sql += " WHERE A.activityId = ?;";
		inserts.push(activityId);
		
		sql = mysql.format(sql, inserts);
		
		db.dbExecuteQuery(sql, res, function(updateActivityResult){
	        updateActivityResult.description="Updated activity for activityId " + activityId;
	        
	        res.send(updateActivityResult);
	        glog.log(updateActivityResult.description);
		});
		
	});
});

//

//-------------------------START-----------------------------------------------------
// POST: create an activity for a user
//TODO: add checking for malformed input from front end and error handling and logging, for successful runs
//add these to transaction table
app.post('/createActivity', function(req,res) {
	auth.checkAuthentication(req, res, function (data) {
		var sql = null;
		var userId = req.user.userId;
		var ringId = req.body.ringId;
//		var bringerUserId = req.body.bringerUserId;
		var maxNumOrders = req.body.maxNumOrders;
		var grubberyId = req.body.grubberyId;
		var lastOrderDateTime = req.body.lastOrderDateTime;
		var malformedInput = false;
		
		if(userId.isNaN) {
			glog.error("Activities.js: User did not enter a number for userId in createActivity API");
			malformedInput = true;
		}
		if(ringId.isNaN) {
			glog.error("Activities.js: User did not enter a number for ringId in createActivity API");
			malformedInput = true;
		}
/*		if(bringerUserId.isNaN) {
			glog.error("Activities.js: User did not enter a number for bringerUserId in createActivity API");
			malformedInput = true;
		}*/
		if(maxNumOrders.isNaN) {
			glog.error("Activities.js: User did not enter a number for maxNumOrders in createActivity API");
			malformedInput = true;
		}
		if(grubberyId.isNaN) {
			glog.error("Activities.js: User did not enter a number for grubberyId in createActivity API");
			malformedInput = true;
		}
		
		/*TODO: check if valid date format - depends on how ui will let u input this*/
		
		if(new Date(lastOrderDateTime).getTime() <= new Date().getTime()) {
			glog.error("Activities.js: User did not enter a lastOrderDateTime greater than the current time in createActivity API");
			malformedInput = true;
		}
		
		if(!malformedInput) {
			sql = "INSERT INTO tblActivity (ringId, bringerUserId, maxNumOrders, grubberyId, lastOrderDateTime) " + 
			"VALUES (?,?,?,?,?);";  
			
			//var inserts = [ringId, bringerUserId, maxNumOrders, grubberyId, lastOrderDateTime];
			var inserts = [ringId, userId, maxNumOrders, grubberyId, lastOrderDateTime];
		    sql = mysql.format(sql, inserts);
		            
		    db.dbExecuteQuery(sql, res, function(insertActivityResult){
		        insertActivityResult.description="Added activity for userId " + userId;
		        res.send(insertActivityResult);
		        
		        glog.log("Activities.js: Added activitiy for userId " + userId);
		    });
		}
	});
});
//-------------------------end-----------------------------------------------------


//-------------------------START-----------------------------------------------------
// GET: get activities (current or expired) for userId
/* Search fields:
    - grubbery name
    - ring name
*/
app.get('/searchActvities/:key', function(req,res) {
	// Check if user session is still valid
	auth.checkAuthentication(req, res, function (data) {
		var key = req.params.key;
		var grubberySql = null;
		
		grubberySql = "SELECT G.name as grubbery, R.name as ringName, U.firstName, U.lastName, "+
			"A.maxNumOrders, A.lastOrderDateTime, A.activityId "+
			"FROM tblGrubbery G "+
				"INNER JOIN tblActivity A "+
				"ON G.grubberyId = A.grubberyId "+
				"INNER JOIN tblRing R "+
				"ON R.ringId = A.ringId "+
				"INNER JOIN tblUser U "+
				"ON A.bringerUserId = U.userId "+
			"WHERE G.name LIKE ? OR R.name LIKE ?;";
			
		var inserts = ["%"+key+"%","%"+key+"%"];
    	grubberySql = mysql.format(grubberySql, inserts);
			
		db.dbExecuteQuery(grubberySql, res, function(activityResult){
			var description = null;
			if(activityResult.data.length == 0) {
				description = "Could not find an activity for your search on " + key;
				var errData = {
					status: activityResult.status,
					description: description,
					data: null
				}
				
				glog.log("Activities.js: Could not find an activity for the search on " + key);
				res.send(errData);
			}
			else {
				description = "Returned activity details";
				var data = {
					status: 'Success',
					description: description,
					data: activityResult.data
				};
				
				glog.log("Activities.js: Returned activity details for the search on " + key);
				res.send(data);
			}
		});
		
	});
});
//-------------------------end-----------------------------------------------------



//-------------------------START-----------------------------------------------------
// GET: get details of selected activity
app.get('/viewActivity/:activityId', function(req,res) {
		// Check if user session is still valid
	auth.checkAuthentication(req, res, function (data) {
		var activitySql = null;
		var ordersSql = null;
		var description = null;
		
		if(req.params.activityId.isNaN) {
			glog.error("Activities.js: User did not enter a number for activityId in viewActivity API");
		} else {
			activitySql = "SELECT G.name, G.addr, G.city, G.state, G.status, A.ringId, A.bringerUserId, A.maxNumOrders "+
			"FROM "+
					"tblGrubbery G INNER JOIN tblActivity A "+
					"ON G.grubberyId = A.grubberyId "+
					"WHERE A.activityId = ?";
			var inserts = [req.params.activityId];
			activitySql = mysql.format(activitySql,inserts);
			
			db.dbExecuteQuery(activitySql, res, function(activityResult){
				if(activityResult.data.length == 0){
					description = "Could not find an activity with activityId " + req.params.activityId;
					var errData = {
						status: activityResult.status,
						description: description,
						data: null
					}
					
					glog.log("Activities.js: Could not find an activity with activityId " + req.params.activityId +
					" so the user is unable to view details for this activity");
					res.send(errData);
				}
				else{
					ordersSql = "SELECT U.userName, U.firstName, U.lastName, OU.orderedOn, OU.itemOrdered, OU.quantity, OU.addnComment, OU.costOfItemOrdered "+
						"FROM tblOrderUser OU INNER JOIN tblUser U "+
						"ON OU.userId = U.userId "+
						"WHERE OU.activityId = ?";
					ordersSql = mysql.format(ordersSql, inserts);
					db.dbExecuteQuery(ordersSql, res, function(ordersResult){
						if(ordersResult.data.length == 0){
							description = "No orders have been placed in this activity yet.";
							glog.log("Activities.js: Viewing details for activity with activityId " + req.params.activityId +
							", but no orders were created within this activity to show in the details");
						}
						else{
							description = "Returned activity details and orders.";
							glog.log("Activities.js: Viewing details for activity with activityId " + req.params.activityId + 
							" and viewing details with its orders");
						}
						var data = {
							status: 'Success',
							description: description,
							data: {
								activity: activityResult.data[0],
								orders: ordersResult.data
							}
						};
						res.send(data);
					});
				}
				
			});
		}
	});
});
//-------------------------end-----------------------------------------------------

//-------------------------START-----------------------------------------------------
// GET: most recent activity date and time for selected ring

app.get('/getLastActivity/:ringId', function(req,res) {
		// Check if user session is still valid
	auth.checkAuthentication(req, res, function (data) {
		var ringId = req.params.ringId;
		var sql = null;
		
		sql = "SELECT A.enteredOn AS enteredDate, A.activityId FROM tblActivityStatus A, tblActivity X " +
		"WHERE A.activityId = X.activityId AND X.ringId = ? ORDER BY enteredDate DESC LIMIT 1;";
		var inserts = [ringId];
		sql = mysql.format(sql, inserts);
		
		  db.dbExecuteQuery(sql, res, function(result){
		  
		  	if(result.status==statusCodes.EXECUTED_QUERY_SUCCESS){
                // Overwrite status and description
                result.status=statusCodes.GET_LAST_ACTIVITY_SUCCESS;
                result.description="Retrieved latest activity date and time for selected ring with ringId: "+ringId;
            } 
            res.send(result);
		  	
		  });
	});
});

//-------------------------START--------------------------------------------------
//get number of activities for a ring id
//TODO: fix the statuses and descs
app.get('/getNumActivities/:ringId', function(req,res) {
		// Check if user session is still valid
	auth.checkAuthentication(req, res, function (data) {
		var ringId = req.params.ringId;
		var sql = null;
		
		sql = "SELECT COUNT(A.ringId) AS numActivities FROM tblActivity A WHERE A.ringId = ?;";
		var inserts = [ringId];
		sql = mysql.format(sql, inserts);
		
		  db.dbExecuteQuery(sql, res, function(result){
		  	if(result.data.length == 0){
                // No data retreieved
                result.status = statusCodes.NO_PENDING_USER_REQUESTS;
                result.description = "No approved or pending requests retrieved for this user id and ring id.";
                res.send(result);
            } else {
                if(result.status==statusCodes.EXECUTED_QUERY_SUCCESS){
                    // Overwrite status and description
                    result.status=statusCodes.UPDATE_USER_ACCESS_TO_RING_SUCCESS;
                    result.description="Got number of activities for that ringid";
                } 
                res.send(result);
            }
		  	
		  });
	});
});
//----------------------------------------------------end--------------------------------

module.exports = app;