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

app.get('/test', function(req,res){ //TEST
	res.send("yo");
});

//RETURNS: Ringname, Grubbringer name, grubbery, number of remaining opernings for orders, and time left to place an order. 
app.get('/', function(req,res){
    
        //include current?scope=1
        
        	var q = null;
    		var q2 = null;
    
    		var user = 3; // this is ringUser - hardcoded for now, will grab as session later
    
    		//first we need to grab all the orderIds for each that is associated with the user as well as the max num of orders for each order id
    		q ="SELECT tblOrder.orderId, SUM(tblOrder.maxNumOrders - tblOrderUser.quantity) " +
    		"AS remainingOrders FROM tblOrder, tblRingUser, tblOrderUser WHERE tblOrder.ringId = tblRingUser.ringId AND tblRingUser.userId = '"+user+"' " +
    		"AND tblOrderUser.orderId = tblOrder.orderId";
    		console.log("and now we begin dum dum dum");
    		//connect to db and execute query
			 pool.getConnection(function(err,connection){
			     if(err){
			         console.log(err);
			     }
			     else if (connection && 'q' in connection){
			          connection.query(q,function(err, rows, fields){
			              if (err){
			                  console.log(err);
			              }
			              else{
			                  for (var i = 0; i < rows.length; i++){
			                      orderid = rows[i].orderId;
                                  maxnumorders = rows[i].maxNumOrders;
                                  console.log("we've now got the", orderid, "and", maxnumorders);
                                  
                                  //now that we have a list of orderids associated with the rings associated with the user, we can return the ringName, grubbringerName and grubbery
                                 q2 = "SELECT tblRing.name AS ringName, tblGrubbery.name AS grubberyName, tblUser.username " +
                                      "FROM tblRing JOIN tblOrder ON tblOrder.ringId = tblRing.ringId JOIN tblGrubbery ON tblOrder.grubberyId = tblGrubbery.grubberyId " +
                                      "JOIN tblUser ON tblOrder.bringerUserId = tblUser.userId WHERE tblOrder.orderId = '"+orderid+"'";
                                      
                                 connection.query(q2,function(err, rows, fields){
                                    if(err){
                                        console.log(err);
                                    }
                                    else{
                                        for (var i = 0; i < rows.length; i++){
                                            console.log(rows[i].ringName+rows[i].grubberyName+rows[i].username);
                                        }
                                    }
                                     
                                     
			                    });
			            
			         }
			     }
			 });
			 connection.release();
		}
			     
	});
	
});
module.exports = app;
