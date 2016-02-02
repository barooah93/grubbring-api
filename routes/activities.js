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
 * TODO:
1. GET A list of activities (both active and expired) that the user either initiated or was a part of
2. POST Create activity where user will create order activity for certain ring
3. GET Search activities - allows you to search current and expired activites that user initiated or was a part of
4. GET View a specific activity's details by clicking on the activity panel on the screen
5. GET View a specific order's details for a user selected
6. Post Create order
    
**/

//Gets a list of the activities (both active and expired) that the user initiated or was a part of. List will be from most active to least active
//FIELDS: ActivityId, Ring name, bringerId, max number of orders, remaining number of orders (indicates whether an activity is open or closed, with the "I'm IN!" button), and the last activity date/time
app.get('/', function(req,res){
	
		auth.checkAuthentication(req,res, function(data){
    		res.json(req.user);	
    		
    		if (res.status == 200){
    		   user = req.user; 
    		}
    	});
    	
    var query;
    
    query = "SELECT tblOrder.orderId AS OrderID, tblOrder.ringId, tblOrder.grubberyId, tblOrder.bringerUserId, tblOrder.lastOrderDateTime, SUM(tblOrder.maxNumOrders - tblOrderUser.quantity) " +
				"AS remainingOrders FROM tblOrder, tblRingUser, tblOrderUser WHERE tblRingUser.userId = '"+user+"' AND tblOrder.ringId = tblRingUser.ringId " +
				"AND tblOrderUser.orderId = tblOrder.orderId GROUP BY tblOrder.orderId ";
				
				db.dbExecuteQuery(q, res, function(result){
					for (var i = 0; i < result.data.length; i++){
					    
					}
					
				});
    	
});

//-------------------------START-----------------------------------------------------
// POST: create an activity for a user - steph - incomplete
app.post('/createActivity', function(req,res) {
	var sql = null;
	
	var userId = req.body.userId;
	var ringId = req.body.ringId;
	var bringerUserId = req.body.bringerUserId;
	var maxNumOrders = req.body.maxNumOrders;
	var grubberyId = req.body.grubberyId;
	var lastOrderDateTime = req.body.lastOrderDateTime; //TODO: get datetime format
	
	sql = "INSERT INTO tblOrder (orderId, ringId, bringerUserId, maxNumOrders, grubberyId, lastOrderDateTime)" + 
	"VALUES ('NULL',?,?,?,?,?);";  
	
	var inserts = [ringId, bringerUserId, maxNumOrders, grubberyId, lastOrderDateTime];
    sql = mysql.format(sql, inserts);
            
    db.dbExecuteQuery(sql, res, function(insertActivityResult){
        
        insertActivityResult.description="Added activity with id for user " + userId;
        res.send(insertActivityResult); //what if this fails
    });
	
});
//-------------------------end-----------------------------------------------------


//-------------------------START-----------------------------------------------------
// GET: get activities (current or expired) for userId
/* Search fields:
    - grubbery name
    - ring name
    - ring leader username
    - ring leader first name last name
*/
// DO WE NEED THIS? FOR DISPLAYING ACTIVITIES 
app.get('/searchActvities/:userId/:key', function(req,res) {
	// Check if user session is still valid
	auth.checkAuthentication(req, res, function (data) {
		var activitySql = null;
		
		
		
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
		
		activitySql = "SELECT G.name, G.addr, G.city, G.state, G.status, O.ringId, O.bringerUserId, O.maxNumOrders "+
			"FROM "+
					"tblGrubbery G INNER JOIN tblOrder O "+
					"ON G.grubberyId = O.grubberyId "+
					"WHERE O.orderId = ?";
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
					"WHERE orderId = ?";
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



//-------------------------START-----------------------------------------------------
// GET: get details of selected order
app.get('/viewOrder/:orderId', function(req,res) {
	
});
//-------------------------end-----------------------------------------------------


//-------------------------START-----------------------------------------------------
// POST: create an order for a user
app.post('/createOrder/:userId', function(req,res) {
	
});
//-------------------------end-----------------------------------------------------

module.exports = app;