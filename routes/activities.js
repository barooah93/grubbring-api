var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;
var async = require('async');
var glog = require('../glog.js')('activity');
var db = require('../dbexecute');
var auth = require('../servicesAuthenticate');
var mysql = require('mysql');

/** variables **/
var user;

/**
 * Activities API Overview:
1. GET A list of activities (both active and expired) that the user either initiated or was a part of
2. POST Create activity where user will create order activity for certain ring
3. GET Search activities - allows you to search current and expired activites that user initiated or was a part of
4. GET View a specific activity's details by clicking on the activity panel on the screen
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

//-------------------------START-----------------------------------------------------
// POST: create an activity for a user
//TODO: add checking for malformed input from front end and error handling and logging, for successful runs
//add these to transaction table
app.post('/createActivity', function(req,res) {
	auth.checkAuthentication(req, res, function (data) {
		var sql = null;
		var userId = req.body.userId;
		var ringId = req.body.ringId;
		var bringerUserId = req.body.bringerUserId;
		var maxNumOrders = req.body.maxNumOrders;
		var grubberyId = req.body.grubberyId;
		var lastOrderDateTime = req.body.lastOrderDateTime;
		
		if(userId.isNaN()) {
			glog.error("Activities.js: User did not enter a number for userId in createActivity API");
			/*TODO: skip db execute*/
		}
		if(ringId.isNaN()) {
			glog.error("Activities.js: User did not enter a number for ringId in createActivity API");
			/*TODO: skip db execute*/
		}
		if(bringerUserId.isNaN()) {
			glog.error("Activities.js: User did not enter a number for bringerUserId in createActivity API");
			/*TODO: skip db execute*/
		}
		if(maxNumOrders.isNaN()) {
			glog.error("Activities.js: User did not enter a number for maxNumOrders in createActivity API");
			/*TODO: skip db execute*/
		}
		if(grubberyId.isNaN()) {
			glog.error("Activities.js: User did not enter a number for grubberyId in createActivity API");
			/*TODO: skip db execute*/
		}

		
		
		sql = "INSERT INTO tblActivity (ringId, bringerUserId, maxNumOrders, grubberyId, lastOrderDateTime) " + 
		"VALUES (?,?,?,?,?);";  
		
		var inserts = [ringId, bringerUserId, maxNumOrders, grubberyId, lastOrderDateTime];
	    sql = mysql.format(sql, inserts);
	            
	    db.dbExecuteQuery(sql, res, function(insertActivityResult){
	        insertActivityResult.description="Added activity for userId " + userId;
	        res.send(insertActivityResult);
	        
	        glog.log("Activities.js: Added activitiy for userId " + userId);
	    });
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
		var userId = req.user.userId;
		var key = req.params.key;
		var grubberySql = null;
		var ringNameSql = null;
		
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
		
		activitySql = "SELECT G.name, G.addr, G.city, G.state, G.status, A.ringId, A.bringerUserId, A.maxNumOrders "+
			"FROM "+
					"tblGrubbery G INNER JOIN tblActivity A "+
					"ON G.grubberyId = A.grubberyId "+
					"WHERE A.activityId = ?";
		var inserts = [req.params.activityId];
		activitySql = mysql.format(activitySql,inserts);
		
		db.dbExecuteQuery(activitySql, res, function(activityResult){
			if(activityResult.data.length == 0){
				description = "Could not find an activity with this activityId " + req.params.activityId;
				var errData = {
					status: activityResult.status,
					description: description,
					data: null
				}
				
				glog.log("Activities.js: Could no find an activity with this activityId " + req.params.activityId +
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
		
	});
});
//-------------------------end-----------------------------------------------------

module.exports = app;