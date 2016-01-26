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
var ordersLeft;
var date = null;
var time = null;
var array = [];
var currdate = null;
var currtime = null;


/**
 * GET functionality will retrieve the current list of rings that you are a part of with activity details
 * Activity details include: ring name, grubbery, grubbringeruser, # of open orders remaining, and time left to place an order
 * Front end will include: "I'M IN!" button to place an order, "Create Activity" button to create a new activity
 *
 */

app.get('/', function(req,res){
	
		// auth.checkAuthentication(req,res, function(data){
  //  		res.json(req.user);	
  //  	});
    		var qtest = null;
        	var q = null;
    		var q2 = null;
    		
    	    // var ct = moment().format(); //this gets the current date and time for the user's system
    	    // var ft = moment.tz(ct, "America/New_York"); //this converts the time to the user's local timezone - should we get the timezone automatically?
    	    // currdate = ft.format('YYYY-MM-DD');
    	    // currtime = ft.format('HH-mm-ss');
    	    
    		user = 143; // this is ringUser - hardcoded for now, will grab as session later
    
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
				
				q ="SELECT tblOrder.orderId AS OrderID, tblOrder.ringId, tblOrder.grubberyId, tblOrder.bringerUserId, COUNT(tblOrderUser.orderId) as ordersPlaced, "+
				   "tblOrder.lastOrderDateTime, tblOrder.maxNumOrders FROM tblOrder, tblRingUser, tblOrderUser WHERE tblRingUser.userId = '"+user+"' AND tblOrder.ringId = tblRingUser.ringId "+
				    "AND tblOrderUser.orderId = tblOrder.orderId GROUP BY tblOrder.orderId";
				
				db.dbExecuteQuery(q, res, function(result){
						//console.log(result.data.length);
					for (var i = 0; i < result.data.length; i++){
						var df = dateformat(result.data[i].lastOrderDateTime, "yyyy-mm-dd");
						time = result.data[i].lastOrderDateTime;
						var tf = dateformat(time, "HH:MM:ss");
						date = df;
						time = tf;
						console.log("this is the date"+df+"and this is the time "+tf);
                        grubid = result.data[i].grubberyId;
                        ringid = result.data[i].ringId;
                        userid = result.data[i].bringerUserId;
                        ordersLeft = result.data[i].maxNumOrders - result.data[i].ordersPlaced;
                        console.log("this is the max"+result.data[i].maxNumOrders);
                        console.log("this is the ordersplaced"+result.data[i].ordersPlaced);
                        var obj = {
                        	GrubID: grubid,
                        	RingID: ringid,
                        	UserID: userid,
                        	RemainingOrders: ordersLeft,
                        	ColDate: date,
                        	ColTime: time
                        }
                        array.push(obj);
                        console.log("we made it!");
                        
				}
				callback(null, result)
				});
				
			},
			
			function(result, callback){
				console.log("this is the length "+array.length);
				for (var i = 0; i < array.length; i++){
					ringid = array[i].RingID;
					userid = array[i].UserID;
					grubid = array[i].GrubID;
					date = array[i].ColDate;
					time = array[i].ColTime;
					ordersLeft = array[i].RemainingOrders;
					
					console.log("this is ringid "+ringid);
					console.log("this is the bringer of food"+userid);
					
				q2 = "SELECT tblRing.name AS ringName, tblGrubbery.name AS grubberyName, tblUser.username FROM " +
                "tblRing JOIN tblOrder ON tblOrder.ringId = tblRing.ringId JOIN tblGrubbery ON tblOrder.grubberyId = tblGrubbery.grubberyId " +
                "JOIN tblUser ON tblOrder.bringerUserId = tblUser.userId JOIN tblOrderUser ON tblOrder.orderId = tblOrderUser.orderId WHERE tblOrder.ringId ='"+ringid+"' AND tblOrder.grubberyId = '"+grubid+"' AND " +
                "tblOrder.bringerUserId = '"+userid+"'";
                
                db.dbExecuteQuery(q2, res, function(result){
              
					result.data = "Ring Name:"+result.data[0].ringName+" Grubbery Name: "+result.data[0].grubberyName+" User name: "+result.data[0].username+" Remaining Orders: "+ordersLeft; 
					console.log(res.headersSent);
                	if (!res.headersSent){
                		console.log("am i here");
                	res.send(result);
               }	
                
                		
               });

			}	
		}
    		
    	]);
	
});



// //RETURNS: List of rings that the user is an owner of
// app.get('/myrings', function(req,res){
	
// 	var user = 143;
// 	var query = "SELECT tblRing.name FROM tblRing WHERE tblRing.createdBy = '"+user+"'";
	
// 	pool.getConnection(function(err,connection){
// 			     if(err){
// 			         console.log(err);
// 			     }
// 			     else if (connection && 'query' in connection){
			     	
// 			          connection.query(query,function(err, rows){
// 			              if (err){
// 			                  console.log(err);
// 			              }
// 			              else{
// 			          			res.json(rows[0]);
			              	
// 			              }
// 			          });
// 			     }
// 	});
// });
module.exports = app;
