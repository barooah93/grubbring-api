var express = require('express');
var app = express.Router();
var debug = require('debug')('grubbring:profile');
//var pool = require('../config/dbconnection.js').pool;
var encrypt = require('../config/passwordEncryption.js');
var authenticate = require('../servicesAuthenticate');
var db = require('../dbexecute');
var authenticate = require('../servicesAuthenticate')
var db = require('../dbexecute.js');
var mysql = require('mysql');

app.get('/',function(req,res){
	authenticate.checkAuthentication(req,res,function(data){
		
		res.json(req.user);
	});
});


app.post('/updateEmail', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        debug(req.method + ' ' + req.url);

        var currEmail = req.user.emailAddr;
        var newEmail = req.body.newEmail;
        var userId = req.user.userId;

        if (!newEmail || currEmail === newEmail) {
            debug('Email field was empty or the same email address was entered');
            res.status(204);
            res.json({
                status: 'error',
                description: 'Empty field or the same email was specified'
            });
        } else {
            var sql = 'UPDATE tblUser SET emailAddr=? WHERE userId=?';
            var inserts = [newEmail, userId];
            sql = mysql.format(sql, inserts);

            db.dbExecuteQuery(sql, res, function(result) {
                result.description = 'Updated Email Address';
                res.json(result);
            });
        }
    })

});

app.post('/updateCellNumber', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        debug(req.method + ' ' + req.url);

        var currCell = req.user.cellPhone;
        var newCell = req.body.newCell;
        var userId = req.user.userId;

        if (!newCell || currCell === newCell) {
            debug('Cell number field was empty or the same number was entered');
            res.status(204);
            res.json({
                status: 'error',
                description: 'Empty field or the new number is the same as the old number'
            })
        } else {
            var sql = 'UPDATE tblUser SET cellPhone=? WHERE userId=?';
            var inserts = [newCell, userId]
            sql = mysql.format(sql, inserts);

            db.dbExecuteQuery(sql, res, function (result) {
                result.description = 'Updated Cell phone number';
                res.json(result);
            })

        }
    });
});

app.post('/updatePassword', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        debug(req.method + ' ' + req.url);

        var oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;
        var confirmPassword = req.body.confirmPassword;
        var oldHash = req.user.password;
        var userId = req.user.userId;

        if (newPassword && oldPassword != newPassword && newPassword === confirmPassword && encrypt.validatePassword(oldPassword, oldHash)) {
            var newHash = encrypt.generateHash(newPassword);

            var sql = 'UPDATE tblUser SET password=? WHERE userId=?';
            var inserts = [newHash, userId];
            sql = mysql.format(sql, inserts);

            db.dbExecuteQuery(sql, res, function (result) {
                result.description = 'Updated password';
                res.json(result);
            });
        } else {
            debug('One of the conditions have failed.');
            res.status(204);
            res.json({
                status: 'error',
                description: 'At least one of the conditions for changing password is false'
            })
        }
    })
});

module.exports = app;