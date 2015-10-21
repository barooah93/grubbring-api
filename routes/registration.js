var express = require('express');
var app = express.Router();
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var encrypt = require('../config/passwordEncryption.js');
var passport = require('passport');
require('../config/passport.js')(passport);
var debug = require('debug')('grubbring:registration');
var db = require('../dbexecute');
var mysql = require('mysql');

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

app.post('/', function(req, res){

	debug(req.method + ' ' + req.url);

		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		var phonenumber = req.body.phonenumber;
		if(phonenumber === undefined){
			phonenumber = 0;
		}
		var username = req.body.username;
		var password = req.body.password;
        var encryptedPassword = encrypt.generateHash(password);

        var email = req.body.email;
        var token = crypto.randomBytes(7).toString('hex');
		var sql = null;
		
		sql = "SELECT * FROM tblUser WHERE username=? OR emailAddr=?;";
		var inserts = [username,email];
		sql = mysql.format(sql, inserts);
		debug(sql);
		db.dbExecuteQuery(sql,res,function(result){
			if(result.data.length > 0){
				result.description = "This username/email has already been used for an account.";
				res.status(200);
				res.json(result);
			}else{
				sql = "INSERT INTO tblUser (username, password, firstName, lastName, emailAddr, cellPhone, confirmationToken) VALUES (?,?,?,?,?,?,?);";
				inserts = [username,encryptedPassword,firstname,lastname,email,phonenumber,token];
				sql = mysql.format(sql, inserts);
				debug(sql);
				db.dbExecuteQuery(sql,res,function(result){
					emailTokenToUser(token,email);
					result.description = "New user created.";
					res.status(201);
					res.json(result);	
				});
			}
		});

});
//---------------------------------------------------------


app.get('/confirmation',function(req,res){
	var data = {
    		"status":"OK",
			"message":"Present Confirmation Page"
		};
		
	res.status(200);
	res.json(data);
	debug(req.method + ' ' + req.url);
});
//---------------------------------------------------------

app.post('/confirmation',function(req,res){
	debug(req.method + ' ' + req.url);
	var status = "active";
	var username = req.body.username;
	var confirmationToken = req.body.token;

	var sql = null;
	sql = "UPDATE tblUser SET accountStatus=? WHERE confirmationToken=? AND username=?";
	var inserts = [status,confirmationToken,username];
	sql = mysql.format(sql, inserts);
	
	db.dbExecuteQuery(sql,res,function(result) {
		if(result.data.affectedRows == 1){
			result.description = "Account has been confirmed.";
		 	res.status(200);
	    	res.json(result);
		}else{
			result.description = "Account could not be confirmed.";
			res.status(200);
			res.json(result);
		}
	    
	});

});

function emailTokenToUser(user_token, user_email){
	//your app url instead of "https://grubbring-api-sshah0930-1.c9.io/"
	var registrationConfirmationUrl = "https://grubbring-api-sshah0930-1.c9.io/api/registration/confirmation";

	var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'grubbring@gmail.com', // Your email id
            pass: 'test2day' // Your password
        }
    });

    var mailOptions = {
    	from: '<grubbring@gmail.com>', // sender address
    	to: '<'+user_email+'>', // list of receivers
    	subject: 'Registration Confirmation Email', // Subject line
    	text: "Enter Confirmation Code at : "+registrationConfirmationUrl+" Confirmation Code : " + user_token 
	};  

	transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
    	debug('Confirmation email sent: ' + info.response);
        // console.log('Message sent: ' + info.response);
    };
});
}

module.exports = app;
