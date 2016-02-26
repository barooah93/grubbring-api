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
				result.data = "Ring Name:"+result.data[i].ringName+" Grubbery Name: "+result.data[i].grubberyName+" User name: "+result.data[i].firstName+" Remaining Orders: "+result.data[i].RemainingOrders; 
				if (!res.headersSent){
                	console.log("am i here");
                	res.send(result);
				}
				
			}
			
		});
		
	// });
	
});
module.exports = app;

// app.get('/', function(req,res){
	
//     	    // var ct = moment().format(); //this gets the current date and time for the user's system
//     	    // var ft = moment.tz(ct, "America/New_York"); //this converts the time to the user's local timezone - should we get the timezone automatically?
//     	    // currdate = ft.format('YYYY-MM-DD');
//     	    // currtime = ft.format('HH-mm-ss');
    	    
//     	//	user = 143; // this is ringUser - hardcoded for now, will grab as session later
    
    			
// 				/***pool.getConnection(function(err, connection) {
// 				    if(err){
// 				    	throw err;
// 				    }
// 				    if(connection && 'query' in connection){
// 				    	callback(null,connection);
// 				    }
// 				});***/
				
// 				// q ="SELECT tblOrder.orderId AS OrderID, tblOrder.ringId, tblOrder.grubberyId, tblOrder.bringerUserId, COUNT(tblOrderUser.orderId) as ordersPlaced, "+
// 				//   "tblOrder.lastOrderDateTime, tblOrder.maxNumOrders FROM tblOrder, tblRingUser, tblOrderUser WHERE tblRingUser.userId = '"+user+"' AND tblOrder.ringId = tblRingUser.ringId "+
// 				//     "AND tblOrderUser.orderId = tblOrder.orderId GROUP BY tblOrder.orderId";
				
				
				
// 				db.dbExecuteQuery(q, res, function(result){
					
					
					
// 					for (var i=0; i < result.data.length; i++){
// 					result.data = "Ring Name:"+result.data[i].ringName+" Grubbery Name: "+result.data[i].grubberyName+" User name: "+result.data[i].username+" Remaining Orders: "+result.data[i].RemainingOrders; 
// 					console.log(res.headersSent);
//                 	if (!res.headersSent){
//                 		console.log("am i here");
//                 	res.send(result);
// 					}
// 				}
					
// 						//console.log(result.data.length);
// 					//for (var i = 0; i < result.data.length; i++){
// 						// var df = dateformat(result.data[i].lastOrderDateTime, "yyyy-mm-dd");
// 						// time = result.data[i].lastOrderDateTime;
// 						// var tf = dateformat(time, "HH:MM:ss");
// 						// date = df;
// 						// time = tf;
// 						// console.log("this is the date"+df+"and this is the time "+tf);
//       //                  grubid = result.data[i].grubberyId;
//       //                  ringid = result.data[i].ringId;
//       //                  userid = result.data[i].bringerUserId;
//       //                  ordersLeft = result.data[i].maxNumOrders - result.data[i].ordersPlaced;
//       //                  console.log("this is the max"+result.data[i].maxNumOrders);
//       //                  console.log("this is the ordersplaced"+result.data[i].ordersPlaced);
//       //                  var obj = {
//       //                  	GrubID: grubid,
//       //                  	RingID: ringid,
//       //                  	UserID: userid,
//       //                  	RemainingOrders: ordersLeft,
//       //                  	ColDate: date,
//       //                  	ColTime: time
//       //                 }
//       //                  array.push(obj);
//       //                  console.log("we made it!");
                        
// 			//	}
				
			
// // 			function(result, callback){
// // 				console.log("this is the length "+array.length);
// // 				for (var i = 0; i < array.length; i++){
// // 					ringid = array[i].RingID;
// // 					userid = array[i].UserID;
// // 					grubid = array[i].GrubID;
// // 					date = array[i].ColDate;
// // 					time = array[i].ColTime;
// // 					ordersLeft = array[i].RemainingOrders;
					
// // 					console.log("this is ringid "+ringid);
// // 					console.log("this is the bringer of food"+userid);
					
// // 				q2 = "SELECT tblRing.name AS ringName, tblGrubbery.name AS grubberyName, tblUser.username FROM " +
// //                 "tblRing JOIN tblOrder ON tblOrder.ringId = tblRing.ringId JOIN tblGrubbery ON tblOrder.grubberyId = tblGrubbery.grubberyId " +
// //                 "JOIN tblUser ON tblOrder.bringerUserId = tblUser.userId JOIN tblOrderUser ON tblOrder.orderId = tblOrderUser.orderId WHERE tblOrder.ringId ='"+ringid+"' AND tblOrder.grubberyId = '"+grubid+"' AND " +
// //                 "tblOrder.bringerUserId = '"+userid+"'";
                
// //                 db.dbExecuteQuery(q2, res, function(result){
              
// // 					result.data = "Ring Name:"+result.data[0].ringName+" Grubbery Name: "+result.data[0].grubberyName+" User name: "+result.data[0].username+" Remaining Orders: "+ordersLeft; 
// // 					console.log(res.headersSent);
// //                 	if (!res.headersSent){
// //                 		console.log("am i here");
// //                 	res.send(result);
// //               }	
                
                		
// //               });

// // 			}	
// // 		}
    		
// //     	]);
	
// // });

// 	});	
	
// }

