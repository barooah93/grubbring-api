var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;
var user = null;
var orderid = null;
var grubbringerName = null;
var ringid = null; 
var maxnumorders = null;
var userid = null;
var grubid = null;


//GET functionality that will retrieve and display "current activity list" of rings if user is a part of at least one ring
//“Current Activity in My Rings” should display a scrollable listing of open activities within the rings the user is a member of.  
//Ring name, grubbringer name, grubbery, number of remaining openings for orders, and time left to place order - a button to “I’m IN” 
//which when tapped should take user to View/Create Order screen.


//RETURNS: Ringname, Grubbringer name, grubbery, number of remaining opernings for orders, and time left to place an order. 
//this gets the list of activities in a user's list of rings, whether user is a member or a grubbringer.
app.get('/', function(req,res){
    
        //TODO: include current?scope=1
        //scope will = 1 only if user elects to view the optional "Current Activities I'm In" list
		
        
        	var q = null;
    		var q2 = null;
    
    		var user = 85; // this is ringUser - hardcoded for now, will grab as session later
    
    		//first we need to grab all the orderIds for each that is associated with the user as well as the remaining number of orders for each orderid
    		q ="SELECT tblOrder.orderId AS OrderID, tblOrder.ringId, tblOrder.grubberyId, tblOrder.bringerUserId, SUM(tblOrder.maxNumOrders - tblOrderUser.quantity) " +
				"AS remainingOrders FROM tblOrder, tblRingUser, tblOrderUser WHERE tblRingUser.userId = '"+user+"' AND tblOrder.ringId = tblRingUser.ringId " +
				"AND tblOrderUser.orderId = tblOrder.orderId GROUP BY tblOrder.orderId";
    		
    		
    		//connect to db and execute query
			 pool.getConnection(function(err,connection){
			     if(err){
			         console.log(err);
			     }
			     else if (connection && 'query' in connection){
			          connection.query(q,function(err, rows){
			              if (err){
			                  console.log(err);
			              }
			              else{
			              	
			              	//this is to get the info that we need for this method
			              	var finalQuery = (q2, function(err, output){
			              		//console.log("i'm here");
			              		if (err){
			              			console.log("err is ", err);
			              		}
			              		else{
			              			q2 = "SELECT tblRing.name AS ringName, tblGrubbery.name AS grubberyName, tblUser.username " +
                                      "FROM tblRing JOIN tblOrder ON tblOrder.ringId = tblRing.ringId JOIN tblGrubbery ON tblOrder.grubberyId = tblGrubbery.grubberyId " +
                                      "JOIN tblUser ON tblOrder.bringerUserId = tblUser.userId WHERE tblOrder.ringId ='"+ringid+"' AND tblOrder.grubberyId = '"+grubid+"' AND " +
                                      "tblOrder.bringerUserId = '"+userid+"'";
                                      
			                    	connection.query(q2,function(err, rows){
			                    		
                                    if(err){
                                        console.log(err);
                                    }
                                    else{
                                    	
                                        for (var i = 0; i < rows.length; i++){
                                        
                                        	//console.log("what am i printing");
                                            console.log(rows[i].ringName+" "+rows[i].grubberyName+" "+rows[i].username+" "+maxnumorders);
                                           
                                    }
                                    
                                 }
                                   
                                     
			                    });
			              		}
			              	});
			            
			                  for (var i = 0; i < rows.length; i++){
                                  maxnumorders = rows[i].remainingOrders;
                                  grubid = rows[i].grubberyId;
                                  ringid = rows[i].ringId;
                                  userid = rows[i].bringerUserId;
                                  //console.log(rows[i]);
                                  console.log("we've now got the", maxnumorders);
                                  
                                  finalQuery(q2, grubid, ringid, userid, maxnumorders);
                                  //finalQuery(grubid, ringid, userid, maxnumorders);
                                  //now that we have a list of orderids associated with the rings associated with the user, we can return the ringName, grubbringerName and grubbery
                              
			                      
			                    }
			                  }  
			 });
			 connection.release();
		}
			     
	});
	
});

//RETURNS: List of rings that the user is an owner of
app.get('/myrings', function(req,res){
	
	var query = "SELECT tblRing.name FROM tblRing WHERE tblRing.createdBy = '"+user+"'";
	
	pool.getConnection(function(err,connection){
			     if(err){
			         console.log(err);
			     }
			     else if (connection && 'query' in connection){
			     	
			          connection.query(query,function(err, rows){
			              if (err){
			                  console.log(err);
			              }
			              else{
			          			//res.send(rows[0].name);
			              	
			              }
			          });
			     }
	});
});
module.exports = app;
