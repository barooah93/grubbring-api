var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;
var async = require('async');
var glog = require('../glog.js')('dashboard');
var db = require('../dbexecute');
var auth = require('../servicesAuthenticate');

/** variables **/
var user;
var array = [];


/**
 * 
 * TODO:
1. GET A list of activities (both active and expired) that the user either initiated or was a part of
2. POST Create activity option where user will create order activity for certain ring
3. GET Search activities - allows you to search current and expired activites that user initiated or was a part of
4. GET View a specific activity's details by clicking on the activity panel on the screen
    
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