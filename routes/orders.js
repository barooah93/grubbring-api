var express = require('express');
var app = express.Router();
var debug = require('debug')('grubbring:profile');
//var pool = require('../config/dbconnection.js').pool;
var encrypt = require('../config/passwordEncryption.js');
var authenticate = require('../servicesAuthenticate');
var crypto = require('crypto');
var db = require('../dbexecute');
var mysql = require('mysql');
var emailServices = require('../emailServices');
var accountAcc = require('../accountAccessibility');


//table order user - each unique order for a user
//table order - 

//create new order for a specific activity
app.post('/createOrder',function(req,res){
	authenticate.checkAuthentication(req,res,function(data){
	    var sql = null;
	    
		var activityId = req.body.activityId; //activity Id
		var userId = req.body.userId;
		var orderedOn = req.body.orderedOn;
		var itemOrdered = req.body.itemOrdered;
		var quantity = req.body.quantity;
		var comment = req.body.comment;
		var cost = req.body.cost;
		var paymentMethod = req.body.paymentMethod;
		var paymentStatus = req.body.paymentStatus;
		
		sql = "INSERT INTO tblOrderUser (orderId, userId, orderedOn, itemOrdered, quantity, comment, cost, paymentMethod, paymentStatus)" +
	"VALUES (?,?,?,?,?,?,?,?,?)";
		
		var inserts = [activityId, userId, orderedOn, itemOrdered, quantity, comment, cost, paymentMethod, paymentStatus];
		
		sql = mysql.format(sql, inserts);
		
		db.dbExecuteQuery(sql, res, function (result) {
			var data = {
				status: 'Success',
				description: 'Order Created'
			};

            res.json(data);
        });
	});
});

app.get('/viewAllOrdersForActivity/:activityId', function(req,res) {
	authenticate.checkAuthentication(req, res, function (data) {
	    var sql = null;
	    
        var activityId = req.params.activityId;
		var userId = req.user.userId;

        sql = "SELECT * FROM tblOrderUser where orderId = ? AND orderid IN ( " +
			"SELECT orderId from tblOrderUser where userId = ? )";
        
        var inserts = [activityId, userId];

		sql = mysql.format(sql, inserts);

		db.dbExecuteQuery(sql, res, function(result) {
			var data = {
				status: 'Success',
				description: '',
				data: {
					orders: result
				}
			}
		});
	});
});

//TODO finish this
app.get('/viewAllOrdersForRing/:ringId', function(req, res) {
	authenticate.checkAuthentication(req, res, function(data) {
		var sql = '';

		//Select * FROM tblOrderUser WHERE orderId IN ( Select orderId from tblOrder WHERE ringId = 2 )
		var userId = req.user.userId;
		var ringId = req.params.ringId;

		sql = '';
	});
});


module.exports = app;

//tblOrder - activities table and tblOrderUser - orders within activites

//1. get all orders related to a specific activity
//2. get all orders related to all activities in a ring
//3. post a new order to a specific activity
//4. update order api call

// note to self - Activity creator has to create an order no matter what, then others can as well.

