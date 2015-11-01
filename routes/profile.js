var express = require('express');
var app = express.Router();
var debug = require('debug')('grubbring:profile');
//var pool = require('../config/dbconnection.js').pool;
var encrypt = require('../config/passwordEncryption.js');
var authenticate = require('../servicesAuthenticate');
var crypto = require('crypto');
var db = require('../dbexecute');
var authenticate = require('../servicesAuthenticate')
var db = require('../dbexecute.js');
var mysql = require('mysql');
var emailServices = require('../emailServices');

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
            res.json({
                status: 'error',
                description: 'At least one of the conditions for changing password is false'
            });
        }
    })
});

app.get('/loginAttempts/:username',function(req, res) {
   var username = req.params.username;
   var sql = "SELECT loginAttempts,accountStatus FROM tblUser WHERE username=?;";
   var inserts = [username];
   sql = mysql.format(sql, inserts);
   
   db.dbExecuteQuery(sql, res, function(result) {
       res.json(result.data[0]);
   });
});


app.post('/resetPassword/generateAccessCode', function(req, res){
   var emailAddress = req.body.email;
   var sql = "SELECT * FROM tblUser WHERE emailAddr=?;";
   var inserts = [emailAddress];
   sql = mysql.format(sql, inserts);
   
   db.dbExecuteQuery(sql, res, function(result) {
      if(result.data.length > 0){ //means that a grubbring user with entered emailAddress exists in database
          //email access code to this email address
          var accessCode = crypto.randomBytes(7).toString('hex');
          var msg = "Enter in this access code to reset your password: "+accessCode
          var subject = "Reset Password Access Code";
          emailServices.emailTokenToUser(msg, subject, emailAddress);
          
          //update access code for this user 
          sql = "UPDATE tblUser SET accessCode=? WHERE emailAddr=?;"
          inserts = [accessCode, emailAddress];
          sql = mysql.format(sql, inserts);
          db.dbExecuteQuery(sql,res,function(result) {
              result.description = "An access code has been emailed to this email address to reset the password."
              res.json(result);
          });
          //send email access code to this email address 
      }else{
          result.description = "There is no account associated with this email address";
          res.json(result);
          // email address doesn't exist as grubbring profile
      }
   });
});

app.post('/resetPassword/validateAccessCode',function(req, res){
    var emailAddress = req.body.email;
    var accessCode = req.body.accessCode;
    
    var sql = "SELECT * FROM tblUser WHERE emailAddr=? AND accessCode=?;"
    var inserts = [emailAddress, accessCode];
    sql = mysql.format(sql, inserts);
          
    db.dbExecuteQuery(sql,res,function(result) {
        if(result.data.length > 0){
            result.description = "This is a valid access code assigned to this user."
            res.json(result);
        }else{
            result.description = "This is an invalid access code for this user."
            res.json(result);
        }
    });
    
});

app.post('/resetPassword', function(req,res){
    var emailAddress = req.body.email;
    var accessCode = req.body.accessCode;
    var newPassword = req.body.newPassword;
    var retypenewPassword = req.body.retypenewPassword;
    
    if(newPassword != retypenewPassword){
        //send message the 2 passwords aren't the same
    }else{
        var encryptedPassword = encrypt.generateHash(newPassword);
        var sql = "UPDATE tblUser SET password=? WHERE emailAddr=? AND accessCode=?;"
        var inserts = [encryptedPassword, emailAddress, accessCode];
        sql = mysql.format(sql, inserts);
        
        db.dbExecuteQuery(sql,res,function(result) {
            res.json(result);
        });
    }
});

module.exports = app;