var express = require('express');
var app = express.Router();
//var pool = require('../config/dbconnection.js').pool;
var encrypt = require('../config/passwordEncryption.js');
var authenticate = require('../servicesAuthenticate');
var crypto = require('crypto');
var db = require('../dbexecute');
var mysql = require('mysql');
var emailServices = require('../emailServices');
var accountAcc = require('../accountAccessibility');
var statusCodes = require('../Utilities/StatusCodesBackend');
var glog = require('../glog')('profile');

app.get('/',function(req,res){
	authenticate.checkAuthentication(req,res,function(data){
		res.json(req.user);
	});
});


// Update email address
app.put('/email', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        var currEmail = req.user.emailAddr;
        var newEmail = req.body.newEmail;

        if (!newEmail) {
            glog.error('Email field was empty');
            res.json({
                status: statusCodes.UPDATE_USER_PROFILE_FAIL,
                description: 'Email field was empty'
            });
        } else if (currEmail === newEmail) {
            glog.error('The same email address was entered');
            res.json({
                status: statusCodes.UPDATE_USER_PROFILE_FAIL,
                description: 'The same email address was specified'
            });
        } else {
            var sql = 'Select * from tblUser where emailAddr = ?';
            var inserts = [newEmail];
            sql = mysql.format(sql, inserts);

            db.dbExecuteQuery(sql, res, function(result) {
                glog.log('Generating access code');
                if (result.data.length > 0) {
                    glog.error('Email already exists');
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
                        glog.log('Sent message to old email');
                        emailServices.sendEmail(oldEmailObj.msg, oldEmailObj.subject, oldEmailObj.emailAddress);

                        glog.log('Sent message to new email with access code ' + accessCode);
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
                    glog.log('Updated Email Address');
                    result.status = statusCodes.UPDATE_USER_PROFILE_SUCCESS;
                    result.description = "Email has been updated.";
                    res.json(result);
                });
            } else {
                glog.error('Invalid accessCode');
                result.description = "This is an invalid access code for this user.";
                result.status = statusCodes.UPDATE_USER_PROFILE_FAIL;
                res.json(result);
            }
        });
    });
});

// Update cell phone
app.put('/cellphone', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        var currCell = req.user.cellPhone;
        var newCell = req.body.newCell;
        var userId = req.user.userId;

        if (!newCell) {
            glog.error('Cell number field is empty');
            res.json({
                status: statusCodes.UPDATE_USER_PROFILE_FAIL,
                description: 'Cell number field is empty'
            })
        } else if (currCell === newCell) {
            glog.error('The new number is the same as the old number');
            res.json({
                status: statusCodes.UPDATE_USER_PROFILE_FAIL,
                description: 'The new number is the same as the old number'
            })
        } else if (isNaN(newCell)) {
            glog.error('The new number is not of type number');
            res.json({
                status: statusCodes.UPDATE_USER_PROFILE_FAIL,
                description: 'The new number is not of type number'
            })
        } else {
            glog.log('Updating cell phone number');
            var sql = 'UPDATE tblUser SET cellPhone=? WHERE userId=?';
            var inserts = [newCell, userId];
            sql = mysql.format(sql, inserts);

            db.dbExecuteQuery(sql, res, function (result) {
                result.description = 'Updated Cell phone number';
                result.status = statusCodes.UPDATE_USER_PROFILE_SUCCESS;
                res.json(result);
            })
        }
    });
});

// Update password
app.put('/password', function(req, res) {
    authenticate.checkAuthentication(req, res, function (data) {
        var newPassword = req.body.newPassword;
        var confirmPassword = req.body.confirmPassword;
        var userId = req.user.userId;

        if (!newPassword) {
            glog.error('New password field is empty.');
            res.json({
                status: statusCodes.UPDATE_USER_PROFILE_FAIL,
                description: 'New password field is empty'
            });
        } else if (newPassword != confirmPassword) {
            glog.error('New password and confirm password do not match');
            res.json({
                status: statusCodes.UPDATE_USER_PROFILE_FAIL,
                description: 'New password and confirm password do not match'
            });
        } else {
            glog.log('Updating password');
            var newHash = encrypt.generateHash(newPassword);

            var sql = 'UPDATE tblUser SET password=? WHERE userId=?';
            var inserts = [newHash, userId];
            sql = mysql.format(sql, inserts);

            db.dbExecuteQuery(sql, res, function (result) {
                result.status = statusCodes.UPDATE_USER_PROFILE_SUCCESS,
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
       if(result.data.length > 0){
          res.json({status:statusCodes.LOGIN_ATTEMPTS_SUCCESS,data:result.data[0]});
       }
       else{
           res.json({status:statusCodes.LOGIN_ATTEMPTS_FAIL,data:result.data[0]});
       }
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