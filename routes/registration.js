var express = require('express');
var app = express.Router();
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var pool = require('../config/dbconnection.js').pool;
var encrypt = require('../config/passwordEncryption.js');
var async = require('async');
var passport = require('passport');
require('../config/passport.js')(passport);
var debug = require('debug')('grubbring:registration');

//-------------------------------------------------------------------

app.get('/', function(req,res){
	var data = {
    		"status":"OK",
			"message":"Present Registration Page"
		};
		
	res.status(200);
	res.json(data);
	debug(req.method + ' ' + req.url);
	res.render('registration');
});
//---------------------------------------------------------

app.post('/', function(req, res){
	//successRedirect means user already exists 
	var firstname = req.body.firstname;
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

    	var data = {
    		"status":"",
			"message":""
		};

		async.waterfall([
			
			function(callback){
				pool.getConnection(function(err, connection) {
				    if(err){
				    	data["status"] = "ERROR";
				    	data["message"] = "Unable to connect to database";
				    	res.status(500);
				    	res.json(data);
				    }
				    if(connection && 'query' in connection){
				    	callback(null,connection);
				    }
				});
			},
			
			//check if this username or email already exists
			function(connection,callback){
				connection.query("SELECT * FROM tblUser WHERE username=? OR emailAddr=?",[username,email],function(err, rows, fields){
					if(err){
						data["status"] = "Error";
				    	data["message"] = "Unable to run SELECT query";
						res.status(500);
						res.json(data);
					}
					if(rows.length != 0){ //user already exists
						data["status"] = "OK";
				    	data["message"] = "User already exists";
						res.status(200);
						res.json(data);
			 			connection.release();
					}
					else{
						console.log("user doesn't exist");
						callback(null,connection);
					}
				});
			},
			
			function(connection,callback){
				connection.query("INSERT INTO tblUser (username, password, firstName, lastName, emailAddr, cellPhone, confirmationToken) VALUES (?,?,?,?,?,?,?)",[username,encryptedPassword,firstname,lastname,email,phonenumber,token],function(err,rows,fields){
					if(err){
						console.log("error inserting new user");
					}
					else{
						data["status"] = "OK";
						data["message"] = "New User Added";
						emailTokenToUser(token,email,function(error){
							if(error){
								console.log(error);
							}
						});
						res.status(201);
						res.json(data);
					}
				});
			connection.release();
			}
			
		]);
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
	res.render('registrationConfirmation');
});
//---------------------------------------------------------

app.post('/confirmation',function(req,res){
	debug(req.method + ' ' + req.url);
	var status = "active";
	var confirmationToken = req.body.token;
	console.log(confirmationToken);
	var data = {
    		"status":"",
			"message":""
		};
	
	async.waterfall([
		
		function(callback){
				pool.getConnection(function(err, connection) {
				    if(err){
				    	data["status"] = "ERROR";
				    	data["message"] = "Unable to connect to database";
				    	res.status(500);
				    	res.json(data);
				    }
				    if(connection && 'query' in connection){
				    	callback(null,connection);
				    }
				});
			},
			
		function(connection,callback){
				connection.query("UPDATE tblUser SET accountStatus=? WHERE confirmationToken=?",[status,confirmationToken],function(err, rows, fields){
					if(err){
						data["status"] = "ERROR";
						data["message"] = "Error running update user status query";
						res.status(500);
			 			res.json(data);
					}
					if(rows.length != 0){
						data["status"] = "OK";
						data["message"] = "Confirmation is complete. User can now login using credentials";
						res.status(200);
			 			res.json(data);
					}
				});
				connection.release();
			}
		
	]);

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