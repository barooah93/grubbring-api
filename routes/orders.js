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
var glog = require('../glog')('orders');
var statusCodes = require('../Utilities/StatusCodesBackend');

//table order user - each unique order for a user
//table order - 

//create new order for a specific activity
app.post('/createOrder',function(req,res){
	authenticate.checkAuthentication(req,res,function(data){
	    var sql = null;

		var activityId = req.body.activityId; //activity Id
		var userId = req.user.userId;
		var orderedOn = new Date();
		var itemOrdered = req.body.itemOrdered;
		var quantity = req.body.quantity;
		var comment = req.body.comment;
		var cost = req.body.cost;
		var paymentMethod = req.body.paymentMethod;
		var paymentStatus = req.body.paymentStatus;

        if (!activityId) glog.error('Missing activityId');
        if (!itemOrdered) glog.error('Missing item ordered');
        if (!quantity) glog.error('Missing quantity');
        if (!comment) glog.error('Missing comment field');
        if (!cost) glog.error('Missing cost');
        if (!paymentMethod) glog.error('Missing payment Method');
        if (!paymentStatus) glog.error('Missing payment status');

        if (!(activityId || itemOrdered || quantity || comment || cost || paymentMethod || paymentStatus)) {
            return res.json({
                status: statusCodes.CREATE_ORDER_FAIL,
                description: 'Some fields were missing.'
            })
        }

		sql = "INSERT INTO tblOrderUser (activityId, userId, orderedOn, itemOrdered, quantity, addnComment, costOfItemOrdered, paymentMethod, paymentStatus) " +
            "VALUES (?,?,?,?,?,?,?,?,?)";

		var inserts = [activityId, userId, orderedOn, itemOrdered, quantity, comment, cost, paymentMethod, paymentStatus];

		sql = mysql.format(sql, inserts);

		db.dbExecuteQuery(sql, res, function (result) {
            glog.log('Created Order');
			var data = {
                status: statusCodes.CREATE_ORDER_SUCCESS,
				description: 'Order Created'
			};

            res.json({
                data: data
            });
        });
	});
});

app.get('/viewAllOrdersForActivity/:activityId', function(req,res) {
	authenticate.checkAuthentication(req, res, function (data) {
	    var sql = null;

        var activityId = req.params.activityId;
		var userId = req.user.userId;

        sql = "SELECT * FROM tblOrderUser WHERE activityId = ? AND activityId IN ( " +
			"SELECT activityId FROM tblOrderUser WHERE userId = ? )";

        var inserts = [activityId, userId];

		sql = mysql.format(sql, inserts);

		db.dbExecuteQuery(sql, res, function(result) {
            result.description = '';

            res.json({
                data: result
            })
		});
	});
});

/*TODO: test*/
app.get('/numOpenOrders/:activityId', function(req,res) {
	authenticate.checkAuthentication(req, res, function (data) {
	    var sql = null;

        var activityId = req.params.activityId;

        sql = "SELECT (SELECT A.maxNumOrders FROM tblActivity A WHERE A.activityId = ?) - (SELECT COUNT(OU.activityId) FROM tblOrderUser OU WHERE OU.activityId = ?) as numOpenOrders;";
        var inserts = [activityId, activityId];

		sql = mysql.format(sql, inserts);

		db.dbExecuteQuery(sql, res, function(result) {
            result.description = '';

            sql = "SELECT lastOrderDateTime from tblActivity WHERE activityId = ?";
            inserts = [activityId];
            sql = mysql.format(sql, inserts);
            db.dbExecuteQuery(sql, res, function(lastOrderInfo) {
                result.data[0].lastOrderDateTime = lastOrderInfo.data[0].lastOrderDateTime;
                res.json(result);
            })
		});
	});
});


app.get('/viewAllOrdersForRing/:ringId', function(req, res) {
	authenticate.checkAuthentication(req, res, function(data) {
		var sql = '';

        var ringId = req.params.ringId;
        var userId = req.user.userId;

        sql = 'SELECT * FROM tblOrderUser WHERE activityId IN ( ' +
                'SELECT activityId FROM tblActivity WHERE ringId = ( ' +
                    'SELECT ringId FROM tblRingUser WHERE userId = ? AND ringId = ? ) ) ';
		var inserts = [userId, ringId];

        sql = mysql.format(sql, inserts);

		db.dbExecuteQuery(sql, res, function(result) {
            result.description = '';

            res.json({
                data: result
            });
        });
	});
});

app.put('/updateOrder', function(req, res) {
    authenticate.checkAuthentication(req,res,function(data){
        var sql = null;

        var activityId = req.body.activityId; //activity Id
        var userId = req.user.userId;
        var orderedOn = new Date();     // should orderedOn be updated with new timestamp or keep old one?
        var itemOrdered = req.body.itemOrdered;
        var quantity = req.body.quantity;
        var comment = req.body.comment;
        var cost = req.body.cost;
        var paymentMethod = req.body.paymentMethod;
        var paymentStatus = req.body.paymentStatus;

        // Getting dup key error when updating with same itemOrdered

        sql = "UPDATE tblOrderUser SET orderedOn = ?, itemOrdered = ?, quantity = ?, addnComment = ?, costOfItemOrdered = ?, " +
            "paymentMethod = ?, paymentStatus = ? WHERE activityId = ? AND userId = ?";

        var inserts = [orderedOn, itemOrdered, quantity, comment, cost, paymentMethod, paymentStatus, activityId, userId];

        sql = mysql.format(sql, inserts);

        db.dbExecuteQuery(sql, res, function (result) {
            result.description = 'Order Updated';

            res.json({
                data: result
            });
        });
    });
});


module.exports = app;

//TODO future update - check to see if activity status is active/inactive (open/close)
//tblOrder - activities table and tblOrderUser - orders within activites

//1. get all orders related to a specific activity
//2. get all orders related to all activities in a ring
//3. post a new order to a specific activity
//4. update order api call

// note to self - Activity creator has to create an order no matter what, then others can as well.


