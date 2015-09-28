var express = require('express');
var app = express.Router();
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var pool = require('../config/dbconnection.js').pool;
var encrypt = require('../config/passwordEncryption.js');
var async = require('async');

//-------------------------------------------------------------------

app.get('/', function(req,res){
	res.render('registration');
});
//---------------------------------------------------------

app.post('/', function(req, res){

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

    if(firstname && lastname && username && password && email){
    	
    	var data = {
			"User":""
		};

		async.waterfall([
			
			function(callback){
				pool.getConnection(function(err, connection) {
				    if(err){
				    	throw err;
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
						
					}
					if(rows.length != 0){ //user already exists
						data["User"] = "Username or Email Address is already used.";
			 			res.json(data);
			 			connection.release();
					}
					else{
						callback(null,connection);
					}
				});
			},
			
			function(connection,callback){
				connection.query("INSERT INTO tblUser (username, password, firstName, lastName, emailAddr, cellPhone, confirmationToken) VALUES (?,?,?,?,?,?,?)",[username,encryptedPassword,firstname,lastname,email,phonenumber,token],function(err,rows,fields){
					if(err){
						data["Users"] = "Error Adding Data";
						res.json(data);
					}
					else{
						data["Users"] = "User Added Successfully";
						console.log(rows[0]);
						console.log(rows);
						emailTokenToUser(token,email,function(error){
							if(error){
								console.log(error);
							}
						});
						res.json(data);
					}
				});
			connection.release();
			}
			
		]);
		
	}else{
		res.redirect('./api/registration');
	}	
});
//---------------------------------------------------------


app.get('/confirmation',function(req,res){
	res.render('registrationConfirmation');
});
//---------------------------------------------------------

app.post('/confirmation',function(req,res){
	var status = "active";
	var token = req.body.token;
	var data = {
			"User":""
		};
	
	async.waterfall([
		
		function(callback){
				pool.getConnection(function(err, connection) {
				    if(err){
				    	throw err;
				    }
				    if(connection && 'query' in connection){
				    	callback(null,connection);
				    }
				});
			},
			
		function(connection,callback){
				connection.query("UPDATE tblUser SET accountStatus=? WHERE confirmationToken=?",[status,token],function(err, rows, fields){
					if(err){
						data["Users"] = "Registration is not confirmed";
			 			res.json(data);
						throw err;
					}
					if(rows.length != 0){
						data["Users"] = "Registration is confirmed";
						res.json(data);	
					}
				});
				connection.release();
			}
		
	]);

});
//---------------------------------------------------------

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
        console.log('Message sent: ' + info.response);
    };
});
}


module.exports = app;