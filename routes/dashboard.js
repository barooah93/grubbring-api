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
var loggedInUser = null;
var orderid = null;
var grubbringerName = null;
var ringid = null; 
var userid = null;
var grubid = null;
var date = null;
var time = null;
var array = [];
var currdate = null;
var currtime = null;




//GET functionality that will retrieve and display "current activity list" of rings if user is a part of at least one ring
//“Current Activity in My Rings” should display a scrollable listing of open activities within the rings the user is a member of.  
//Ring name, grubbringer name, grubbery, number of remaining openings for orders, and time left to place order - a button to “I’m IN” 
//which when tapped should take user to View/Create Order screen.


//RETURNS: Ringname, Grubbringer name, grubbery, number of remaining opernings for orders, and time left to place an order. 
//this gets the list of activities in a user's list of rings, whether user is a member or a grubbringer.
app.get('/', function(req,res){
	
		auth.checkAuthentication(req,res, function(data){
    		res.json(req.user);	
    	});
    
        //TODO: include current?scope=1
        //scope will = 1 only if user elects to view the optional "Current Activities I'm In" list
        	var q = null;
    		var q2 = null;
    		
    		
    	    var ct = moment().format(); //this gets the current date and time for the user's system
    	    var ft = moment.tz(ct, "America/New_York"); //this converts the time to the user's local timezone - should we get the timezone automatically?
    	    currdate = ft.format('YYYY-MM-DD');
    	    currtime = ft.format('HH-mm-ss');
    	    
    		
    		//user = 85; // this is ringUser - hardcoded for now, will grab as session later
    
    		async.waterfall ([
    			
    			function(callback){
				/***pool.getConnection(function(err, connection) {
				    if(err){
				    	throw err;
				    }
				    if(connection && 'query' in connection){
				    	callback(null,connection);
				    }
				});***/
				
				q ="SELECT tblOrder.orderId AS OrderID, tblOrder.ringId, tblOrder.grubberyId, tblOrder.bringerUserId, tblOrder.lastOrderDateTime, SUM(tblOrder.maxNumOrders - tblOrderUser.quantity) " +
				"AS remainingOrders FROM tblOrder, tblRingUser, tblOrderUser WHERE tblRingUser.userId = '"+user+"' AND tblOrder.ringId = tblRingUser.ringId " +
				"AND tblOrderUser.orderId = tblOrder.orderId GROUP BY tblOrder.orderId";
				
				db.dbExecuteQuery(q, res, function(result){
						//console.log(result.data.length);
					for (var i = 0; i < result.data.length; i++){
						//maxnumorders = rows[i].remainingOrders;
						var df = dateformat(result.data[i].lastOrderDateTime, "yyyy-mm-dd HH:MM:ss");
						time = result.data[i].lastOrderDateTime;
						var tf = dateformat(time, "HH:MM:ss");
						date = df;
						time = tf;
                        grubid = result.data[i].grubberyId;
                        ringid = result.data[i].ringId;
                        userid = result.data[i].bringerUserId;
                        var obj = {
                        	GrubID: grubid,
                        	RingID: ringid,
                        	UserID: userid,
                        	ColDate: date,
                        	ColTime: time
                        }
                        array.push(obj);
                        
				}
				
				callback(null, result)
				});
				
			},
			
			function(result, callback){
				
				for (var i = 0; i < array.length; i++){
					//maxnumorders = array[i].RemainingOrders;
					ringid = array[i].RingID;
					userid = array[i].UserID;
					grubid = array[i].GrubID;
					date = array[i].ColDate;
					time = array[i].ColTime;
					
				q2 = "SELECT tblRing.name AS ringName, tblGrubbery.name AS grubberyName, DATEDIFF('"+date+"','"+currdate+"') AS RemainingDate, TIMEDIFF('"+time+"','"+currtime+"') AS RemainingTime, tblUser.username, tblOrder.maxNumOrders AS RemainingOrders " +
                "FROM tblRing JOIN tblOrder ON tblOrder.ringId = tblRing.ringId JOIN tblGrubbery ON tblOrder.grubberyId = tblGrubbery.grubberyId " +
                "JOIN tblUser ON tblOrder.bringerUserId = tblUser.userId JOIN tblOrderUser ON tblOrder.orderId = tblOrderUser.orderId WHERE tblOrder.ringId ='"+ringid+"' AND tblOrder.grubberyId = '"+grubid+"' AND " +
                "tblOrder.bringerUserId = '"+userid+"'";
                
                db.dbExecuteQuery(q2, res, function(result){
              
					result.data = "Ring Name:"+result.data[0].ringName+" Grubbery Name: "+result.data[0].grubberyName+" User name: "+result.data[0].username+" Remaining Orders: "+(result.data[0].RemainingOrders - 1)+" Time left to place an order :"+result.data[0].RemainingDate+" day(s) "+result.data[0].RemainingTime;
					console.log(res.headersSent);
                	if (!res.headersSent){
                	res.send(result);
               }	
                
                		
               });

			}	
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
