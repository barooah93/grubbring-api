var express = require('express');
var app = express();
var moment = require('moment-timezone');
var dateformat = require('dateformat');
var pool = require('../config/dbconnection.js').pool;
var async = require('async');
var glog = require('../glog.js')('dashboard');
var db = require('../dbexecute');
var auth = require('../servicesAuthenticate');


/** variables **/
var user = null;
var time = null;
var currdate = null;
var currtime = null;
var array = [];



/**
 * GET functionality will retrieve the current list of rings that you are a part of with activity details
 * Activity details include: ring name, grubbery, grubbringeruser, # of open orders remaining, and time left to place an order
 * Front end will include: "I'M IN!" button to place an order, "Create Activity" button to create a new activity
 *
 * EX: BDUBZ4LIFE, Buffalo Wild Wings, Brandon, 8, 2 hours
 */
 
 
app.get('/', function(req,res) {
	
	// auth.checkAuthentication(req,res, function(data){
 //   	res.json(req.user);	
 //   //	user = req.user; //this is the user that's logged in
	
    	user = 143 /* FOR TESTING PURPOSES ONLY */
    
    	var q = null;
    	
    	q = "SELECT DISTINCT tblRing.name AS ringName, tblGrubbery.name AS grubberyName, tblUser.firstName, t.maxNumOrders - t.ordersPlaced AS RemainingOrders " +
				"FROM tblRing, tblActivity, tblGrubbery, tblUser, tblOrderUser, " +
				"(SELECT tblActivity.activityId AS activityID, tblActivity.ringId, tblActivity.grubberyId, tblActivity.bringerUserId, tblRingUser.userId, COUNT(tblOrderUser.activityId) as ordersPlaced, " +
				"tblActivity.lastOrderDateTime, tblActivity.maxNumOrders FROM tblActivity, tblRingUser, tblOrderUser WHERE tblRingUser.userId = '143' AND tblActivity.ringId = tblRingUser.ringId " +
				"AND tblOrderUser.activityId = tblActivity.activityId GROUP BY tblActivity.activityId ) AS t WHERE tblActivity.ringId = tblRing.ringId AND tblActivity.grubberyId = tblGrubbery.grubberyId " +
				"AND tblActivity.bringerUserId = tblUser.userId AND tblActivity.activityId = tblOrderUser.activityId AND tblActivity.ringId = t.ringId AND tblActivity.grubberyId = t.grubberyId " +
				"AND tblActivity.bringerUserId = t.bringerUserId";
				
		db.dbExecuteQuery(q, res, function(result){
			
			//leaving out the date and time for now
			for (var i=0; i < result.data.length; i++){
				var obj = {
					ringName: result.data[i].ringName,
					grubberyName: result.data[i].grubberyName,
					firstName: result.data[i].firstName,
					remainingOrders: result.data[i].RemainingOrders
				}
				array.push(obj);
			}
				console.log("this is the length "+array.length);
				result.data = array;
				//"Ring Name:"+result.data[i].ringName+" Grubbery Name: "+result.data[i].grubberyName+" Name: "+result.data[i].firstName+" Remaining Orders: "+result.data[i].RemainingOrders; 
				if (!res.headersSent){
                	res.send(result);
				}
				
		
			
		});
		
	// });
	
});
module.exports = app;



