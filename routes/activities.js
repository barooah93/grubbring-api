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
 * 
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
				}
				else{
					status="status code"
					description = "No activities are associated with this user.";
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
		
		sql = "INSERT INTO tblActivity (ringId, bringerUserId, maxNumOrders, grubberyId, lastOrderDateTime) " + 
		"VALUES (?,?,?,?,?);";  
		
		var inserts = [ringId, bringerUserId, maxNumOrders, grubberyId, lastOrderDateTime];
	    sql = mysql.format(sql, inserts);
	            
	    db.dbExecuteQuery(sql, res, function(insertActivityResult){
	        insertActivityResult.description="Added activity with id for user " + userId;
	        res.send(insertActivityResult);
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
			if(activityResult.data.length == 0){
				description = "Could not find an activity for your search on " + key + ".";
				var errData = {
					status: activityResult.status,
					description: description,
					data: null
				}
				res.send(errData);
			}
			else {
				description = "Returned activity details";
				var data = {
					status: 'Success',
					description: description,
					data: activityResult.data
				};
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
				description = "Could not find an activity with this ID.";
				var errData = {
					status: activityResult.status,
					description: description,
					data: null
				}
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
					}
					else{
						description = "Returned activity details and orders.";
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