var express = require('express');
var app = express.Router();
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var encrypt = require('../config/passwordEncryption.js');
var passport = require('passport');
require('../config/passport.js')(passport);
var debug = require('debug')('grubbring:registration');
var db = require('../dbexecute');
var emailServices = require('../emailServices');
var mysql = require('mysql');
var accountAcc = require('../accountAccessibility');

//-------------------------------------------------------------------

app.get('/', function(req,res){
	debug(req.method + ' ' + req.url);
	var data = {
    		"status":"success",
			"message":"Present Registration Page"
		};

	res.status(200);
	res.json(data);

});
//---------------------------------------------------------

app.post('/beginRegistration', function(req, res){

	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
    var emailAddress = req.body.email;
    console.log(emailAddress);
	
	var sql = "SELECT * FROM tblUser WHERE emailAddr=?;";
    var inserts = [emailAddress];
    sql = mysql.format(sql, inserts);
        
    db.dbExecuteQuery(sql,res,function(result) {
       if(result.data.length < 1){ //user doesn't exist already. add them.
      		console.log("user doesn't exist. add them.");
       		var accessCode = "";
          	accountAcc.generateAccessCode(emailAddress,function(data){
              accessCode = data;
          	});
          	
          	sql = "INSERT INTO tblUser (firstName, lastName, emailAddr, cellPhone, accessCode) VALUES (?,?,?,?,?);";
          	inserts = [firstname, lastname, emailAddress, phonenumber, accessCode];
          	sql = mysql.format(sql, inserts);
          	db.dbExecuteQuery(sql,res,function(result) {
              	result.description = "New User added. Access Code is emailed to them to continue registration process.";
              	res.json(result);
          	});
          
       }else{//user already exists
       		console.log("user already exists.");
       		result.status = "fail";
       		result.description = "User with this email address or phone number already exists.";
            res.json(result.status);
       }
    });	
});

app.post('/validateAccessCode', function(req, res){
	var emailAddress = req.body.email;
	var accessCode = req.body.accessCode;
	console.log(emailAddress);
	accountAcc.validateAccessCode(emailAddress,accessCode,res,function(data){
        res.json(data);
    });
	
});

app.post('/setPassword', function(req,res){
    var emailAddress = req.body.email;
    var accessCode = req.body.accessCode;
    var password = req.body.password;
    console.log(password);
    var encryptedPassword = encrypt.generateHash(password);
    
    accountAcc.resetPassword(emailAddress, accessCode, encryptedPassword, res, function(data){
        res.json(data);
    });

});


module.exports = app;
