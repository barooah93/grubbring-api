var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;
var user = null;
var orderid = null;
var grubbringerName = null;
var ringName = null; 
var maxnumorders = null;
var output = null;

//GET functionality that will retrieve and display "current activity list" of rings if user is a part of at least one ring
//“Current Activity in My Rings” should display a scrollable listing of open activities within the rings the user is a member of.  
//Ring name, grubbringer name, grubbery, number of remaining openings for orders, and time left to place order - a button to “I’m IN” 
//which when tapped should take user to View/Create Order screen.

//scope will = 1 only if user elects to view the optional "Current Activities I'm In" list
//this gets the list of activities in a user's list of rings, whether user is a member or a grubbringer. 

//RETURNS: Ringname, Grubbringer name, grubbery, number of remaining opernings for orders, and time left to place an order. 
app.get('/current?scope=1', function(req,res){
    
        if (req.query.scope == '1'){
       
        //TODO
        }
        else{
        	var q = null;
    		var q2 = null;
    
    		var user = 3; // this is ringUser - hardcoded for now, will grab as session later
    
    		//first we need to grab all the orderIds for each that is associated with the user as well as the max num of orders for each order id
    		q ="SELECT tblOrder.orderId, tblOrder.maxNumOrders FROM tblOrder, tblRingUser WHERE tblOrder.ringId = tblRingUser.ringId" +
    		"AND tblRingUser.userId ='"+user+"'";
    		
    		
        }
});
module.exports = app;