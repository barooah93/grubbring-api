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
    
    TODO: update tblOrder to tblActivity in SQL to reflect change in database
    
**/

//Gets a list of the activities (both active and expired) that the user initiated or was a part of. List will be from most active to least active
//FIELDS: ActivityId, Ring name, bringerId, max number of orders, remaining number of orders (indicates whether an activity is open or closed, with the "I'm IN!" button), and the last activity date/time
app.get('/', function(req,res){
	
	var userId;	// user's ID
	
	var ringIds=[]; // array of ring ID's the user is a part of
	
	// check authentication of user
	auth.checkAuthentication(req,res, function(data){

		// retrieve userId
		userId = req.user.userId; 

					
		/*
		get rings a user is a part of
			get all active/inactive activities in those rings
		*/
		
		// Get rings associated with this userId
		var ringsSql = "SELECT ringId FROM tblRingUser WHERE userId=? AND status=1;"
		var inserts = [userId];
	    ringsSql = mysql.format(ringsSql, inserts);
	    
	    // execute query and get result object
	    db.dbExecuteQuery(ringsSql, res, function(result){
		    // push ring ids that this user owns to the ringIds array
		    for(var i=0; i<result.data.length; i++){
		        ringIds.push(result.data[i].ringId);
		    }
	   
	   		/*
			summing on O.order id sums the numerical value of the order ids. not the actual orderids so you need to do 
			groupby order id!!
			*/
			if(ringIds.length <= 0){
				var resultObj = {
					status: "success",
					description: "no rings associated with this user.",
					data: null
				}
				res.send(resultObj);
			}
			
			var activitiesSql = "SELECT O.ringId, O.orderId, U.firstName, U.lastName, O.maxNumOrders, O.lastOrderDateTime, G.name as grubberyName, "+
					"G.addr as grubberyAddress, G.city as grubberyCity, (O.maxNumOrders-SUM(O.orderId)) as remainingOrders "+
					"FROM tblUser U "+
						"Inner Join tblOrder O ON "+
						"U.userId=O.bringerUserId "+
							"INNER JOIN tblGrubbery G ON "+
							"G.grubberyId = O.grubberyId "+
					"WHERE ";
			
			// Concatenate sql statement if there is more than 1 ring to deal with
		    for(var i=0; i<ringIds.length; i++){
		        activitiesSql+= "O.ringId = ? OR ";
		        inserts = [ringIds[i]];
		        activitiesSql = mysql.format(activitiesSql,inserts);
		    }
		    // eliminate the extra 'OR ' and finish the sql statment
		    activitiesSql = activitiesSql.substring(0,activitiesSql.length - 4) + " GROUP BY O.orderId;";
			var inserts = [userId];
			activitiesSql = mysql.format(activitiesSql, inserts);
			
			db.dbExecuteQuery(activitiesSql, res, function(result){
				
				var resultObject;// resulting object
				var status = "success";
				var description;
				var data;
				
				if(result.data.length > 0){
					description = "successfully pulled all activities associated with this user.";
				}
				else{
					description = "there are no activities associated with this user.";
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
});

//-------------------------START-----------------------------------------------------
// POST: create an activity for a user
//steph -
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

module.exports = app;