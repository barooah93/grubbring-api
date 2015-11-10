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
                debug('Generating access code');
                if (result.data.length > 0) {
                    debug('Email already exists');
                    res.json({
                        status: 'error',
                        description: 'The email specified already exists'
                    });
                } else {
                    var oldEmailObj = {
                        emailAddress: currEmail,
                        subject: 'Grubbring - email change request',
                        msg: 'Your request to change your email has been processed. \n If you did not make this change, please contact Grubbring.'
                    };

                    var accessCode = crypto.randomBytes(7).toString('hex');

                    var newEmailObj = {
                        emailAddress: newEmail,
                        subject: 'Grubbring - change email access code',
                        msg: 'Enter this access code to update your email address: ' + accessCode
                    };

                    sql = 'Update tblUser set accessCode = ? where emailAddr = ?';
                    inserts = [accessCode, oldEmailObj.emailAddress];
                    sql = mysql.format(sql, inserts);

                    db.dbExecuteQuery(sql, res, function(result) {
                        debug('Sent message to old email');
                        emailServices.sendEmail(oldEmailObj.msg, oldEmailObj.subject, oldEmailObj.emailAddress);

                        debug('Sent message to new email with access code ' + accessCode);
                        emailServices.sendEmail(newEmailObj.msg, newEmailObj.subject, newEmailObj.emailAddress);

                        result.description = 'An access code has been sent to the new email address.';
                        res.json(result);
                    });
                }
            });
        }
    })
});

app.put('/email/validateAccessCode',function(req, res){
    authenticate.checkAuthentication(req, res, function (data) {
        var oldEmail = req.user.emailAddr;
        var newEmail = req.body.newEmail;
        var accessCode = req.body.accessCode;

        var sql = "SELECT * FROM tblUser WHERE emailAddr=? AND accessCode=?;";
        var inserts = [oldEmail, accessCode];
        sql = mysql.format(sql, inserts);

        db.dbExecuteQuery(sql, res, function (result) {
            if (result.data.length > 0) {
                sql = "Update tblUser set emailAddr = ? where emailAddr = ? and accessCode = ?";
                inserts = [newEmail, oldEmail, accessCode];
                sql = mysql.format(sql, inserts);
                db.dbExecuteQuery(sql, res, function (result) {
                    debug('Updated Email Address');
                    result.description = "Email has been updated.";
                    res.json(result);
                });
            } else {
                debug('Invalid accessCode');
                result.description = "This is an invalid access code for this user.";
                result.status = "fail";
                res.json(result);
            }
        });
    });
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

app.get('/loginAttempts/:email',function(req, res) {
   var email = req.params.email;
   var sql = "SELECT loginAttempts,accountStatus FROM tblUser WHERE emailAddr=?;";
   var inserts = [email];
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
          var accessCode = "";
          accountAcc.generateAccessCode(emailAddress,function(data){
              accessCode = data;
          });
          
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
    
    accountAcc.validateAccessCode(emailAddress,accessCode,res,function(data){
        res.json(data);
    });
    
});

app.post('/resetPassword', function(req,res){
    var emailAddress = req.body.email;
    var accessCode = req.body.accessCode;
    var newPassword = req.body.newPassword;
    var encryptedPassword = encrypt.generateHash(newPassword);
    
    accountAcc.resetPassword(emailAddress, accessCode, encryptedPassword, res, function(data){
        res.json(data);
    });

});

module.exports = app;