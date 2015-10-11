var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;
var user = null;
var loggedInUser = null;
var orderid = null;
var grubbringerName = null;
var ringid = null; 
var userid = null;
var grubid = null;
var async = require('async');
var array = [];
var debug = require('debug')('grubbring:dashboard');


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
    
    		if(req.isAuthenticated == true){
    			loggedInUser = req.user.userId;
    		}
    		else{
    			debug("There is no user on session");
				var data = {
    				"status":"UNAUTHORIZED",
					"message":"Please login using correct username and password"
			};
				res.status(500);
				res.json(data);
    		}
    
    		var user = 85; // this is ringUser - hardcoded for now, will grab as session later
    
    
    		async.waterfall ([
    			function(callback){
				pool.getConnection(function(err, connection) {
				    if(err){
				    	throw err;
				    }
				    if(connection && 'query' in connection){
				    	callback(null,connection);
				    }
				});
			},
			
			function(connection, callback){
				
				q ="SELECT tblOrder.orderId AS OrderID, tblOrder.ringId, tblOrder.grubberyId, tblOrder.bringerUserId, SUM(tblOrder.maxNumOrders - tblOrderUser.quantity) " +
				"AS remainingOrders FROM tblOrder, tblRingUser, tblOrderUser WHERE tblRingUser.userId = '"+user+"' AND tblOrder.ringId = tblRingUser.ringId " +
				"AND tblOrderUser.orderId = tblOrder.orderId GROUP BY tblOrder.orderId";
				
				connection.query(q, function(err, rows){
					if (err){
						console.log(err);
					}
					else{
					for (var i = 0; i < rows.length; i++){
						//maxnumorders = rows[i].remainingOrders;
                        grubid = rows[i].grubberyId;
                        ringid = rows[i].ringId;
                        userid = rows[i].bringerUserId;
                        var obj = {
                        	//RemainingOrders: maxnumorders,
                        	GrubID: grubid,
                        	RingID: ringid,
                        	UserID: userid
                        }
                        array.push(obj);
                        
				}
					callback(null, connection);
					}
				});
				
				
			},
			
			function(connection, callback){
				
				for (var i = 0; i < array.length; i++){
					//maxnumorders = array[i].RemainingOrders;
					ringid = array[i].RingID;
					userid = array[i].UserID;
					grubid = array[i].GrubID;
					
					//console.log("this is the remaining orders", maxnumorders);
					
				q2 = "SELECT tblRing.name AS ringName, tblGrubbery.name AS grubberyName, tblUser.username, SUM(tblOrder.maxNumOrders - tblOrderUser.quantity) AS RemainingOrders " +
                "FROM tblRing JOIN tblOrder ON tblOrder.ringId = tblRing.ringId JOIN tblGrubbery ON tblOrder.grubberyId = tblGrubbery.grubberyId " +
                "JOIN tblUser ON tblOrder.bringerUserId = tblUser.userId JOIN tblOrderUser ON tblOrder.orderId = tblOrderUser.orderId WHERE tblOrder.ringId ='"+ringid+"' AND tblOrder.grubberyId = '"+grubid+"' AND " +
                "tblOrder.bringerUserId = '"+userid+"'";
                
                connection.query(q2,function(err, rows){
			       //console.log(rows.length);        		
                    if(err){
                      console.log(err);
                    }
                   else{
                   		console.log(rows[0].ringName+" "+rows[0].grubberyName+" "+rows[0].username+" "+rows[0].RemainingOrders);
                   		
                }
                
				});
			
               
		}   
				
               //connection.release();
			}
    		
    	]);
	
});

//RETURNS: List of rings that the user is an owner of
app.get('/myrings', function(req,res){
	
	var user = 85;
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
			          			res.json(rows[0]);
			              	
			              }
			          });
			     }
	});
});
module.exports = app;
