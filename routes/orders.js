<<<<<<< HEAD
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
	    
		var orderId = req.body.orderId; //activity Id
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
		
		var inserts = [orderId, userId, orderedOn, itemOrdered, quantity, comment, cost, paymentMethod, paymentStatus];
		
		sql = mysql.format(sql, inserts);
		
		db.dbExecuteQuery(sql, res, function (result) {
            result.description = "Order Created.";
            res.json(result);
        });
	});
});

app.get('/viewAllOrdersForActivity/:activityId', function(req,res) {
	authenticate.checkAuthentication(req, res, function (data) {
	    var sql = null;
	    
        var activityId = req.params.activityId;
        
        sql = "SELECT * FROM tblOrderUser WHERE orderId=?";
        
        var inserts = [activityId];
		
		
	});
});


module.exports = app;
=======
//tblOrder - activities table and tblOrderUser - orders within activites

//1. get all orders related to a specific activity
//2. get all orders related to all activities in a ring
//3. post a new order to a specific activity
//4. update order api call
>>>>>>> fe0a3a408f4ed9077ae2f149db84c679636c904e
