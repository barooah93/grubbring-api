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


// Update email address
app.put('/email', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        debug(req.method + ' ' + req.url);

        var currEmail = req.user.emailAddr;
        var newEmail = req.body.newEmail;
        var userId = req.user.userId;

        if (!newEmail) {
            debug('Email field was empty');
            res.json({
                status: 'error',
                description: 'Email field was empty'
            });
        } else if (currEmail === newEmail) {
            debug('The same email address was entered');
            res.json({
                status: 'error',
                description: 'The same email address was specified'
            });
        } else {
            var sql = 'Select * from tblUser where emailAddr = ?';
            var inserts = [newEmail];
            sql = mysql.format(sql, inserts);

            db.dbExecuteQuery(sql, res, function(result) {
                if (result.data.length > 0) {
                    debug('Email already exists');
                    res.json({
                        status: 'error',
                        description: 'The email specified already exists'
                    });
                } else {
                    debug('Updating email address');
                    var sql = 'UPDATE tblUser SET emailAddr=? WHERE userId=?';
                    var inserts = [newEmail, userId];
                    sql = mysql.format(sql, inserts);

                    db.dbExecuteQuery(sql, res, function(result) {
                        result.description = 'Updated Email Address';
                        res.json(result);
                    });
                }
            });
        }
    })
});

// Update cell phone
app.put('/cellphone', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        debug(req.method + ' ' + req.url);

        var currCell = req.user.cellPhone;
        var newCell = req.body.newCell;
        var userId = req.user.userId;

        if (!newCell) {
            debug('Cell number field is empty');
            res.json({
                status: 'error',
                description: 'Cell number field is empty'
            })
        } else if (currCell === newCell) {
            debug('The new number is the same as the old number');
            res.json({
                status: 'error',
                description: 'The new number is the same as the old number'
            })
        } else if (isNaN(newCell)) {
            debug('The new number is not of type number');
            res.json({
                status: 'error',
                description: 'The new number is not of type number'
            })
        } else {
            debug('Updating cell phone number');
            var sql = 'UPDATE tblUser SET cellPhone=? WHERE userId=?';
            var inserts = [newCell, userId];
            sql = mysql.format(sql, inserts);

            db.dbExecuteQuery(sql, res, function (result) {
                result.description = 'Updated Cell phone number';
                res.json(result);
            })
        }
    });
});

// Update password
app.put('/password', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        debug(req.method + ' ' + req.url);

        var newPassword = req.body.newPassword;
        var confirmPassword = req.body.confirmPassword;
        var userId = req.user.userId;

        if (!newPassword) {
            debug('New password field is empty.');
            res.json({
                status: 'error',
                description: 'New password field is empty'
            });
        } else if (newPassword != confirmPassword) {
            debug('New password and confirm password do not match');
            res.json({
                status: 'error',
                description: 'New password and confirm password do not match'
            });
        } else {
            debug('Updating password');
            var newHash = encrypt.generateHash(newPassword);

            var sql = 'UPDATE tblUser SET password=? WHERE userId=?';
            var inserts = [newHash, userId];
            sql = mysql.format(sql, inserts);

            db.dbExecuteQuery(sql, res, function (result) {
                result.description = 'Updated password';
                res.json(result);
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
   console.log(emailAddress);
   var sql = "SELECT * FROM tblUser WHERE emailAddr=?;";
   var inserts = [emailAddress];
   sql = mysql.format(sql, inserts);
   
   db.dbExecuteQuery(sql, res, function(result) {
      if(result.data.length > 0){ //means that a grubbring user with entered emailAddress exists in database
          //email access code to this email address
          var accessCode = crypto.randomBytes(7).toString('hex');
          var msg = "Enter in this access code to reset your password: "+accessCode
          var subject = "Reset Password Access Code";
          console.log(accessCode);
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
          result.status = "fail";
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
            result.status = "fail";
            res.json(result);
        }
    });
    
});

app.post('/resetPassword', function(req,res){
    var emailAddress = req.body.email;
    var accessCode = req.body.accessCode;
    var newPassword = req.body.newPassword;
    var retypenewPassword = req.body.retypenewPassword;
    var status = "active";
    var loginAttempts = 3;
    
    if(newPassword != retypenewPassword){
        res.json({"status":"fail"});
        //send message the 2 passwords aren't the same
    }else{
        var encryptedPassword = encrypt.generateHash(newPassword);
        var sql = "UPDATE tblUser SET password=?,accountStatus=?,loginAttempts=? WHERE emailAddr=? AND accessCode=?;"
        var inserts = [encryptedPassword,status,loginAttempts, emailAddress, accessCode];
        sql = mysql.format(sql, inserts);
        
        db.dbExecuteQuery(sql,res,function(result) {
            res.json(result);
        });
    }
});

module.exports = app;