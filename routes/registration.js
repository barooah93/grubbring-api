var express = require('express');
var app = express.Router();
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var pool = require('../config/dbconnection.js').pool;
var encrypt = require('../config/passwordEncryption.js')

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

    	pool.getConnection(function(err,connection){
		if(err){
			console.log(err);
		}else if(connection && 'query' in connection){
			connection.query("INSERT INTO tblUser (username, password, firstName, lastName, emailAddr, cellPhone, confirmationToken) VALUES (?,?,?,?,?,?,?)",[username,encryptedPassword,firstname,lastname,email,phonenumber,token],function(err, rows, fields){
			var data = {
				"User":""
			};
			if(!!err){
				console.log(err);
				data["Users"] = "Error Adding data";
				res.json(data);
			}else{
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
			
		});	
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

	pool.getConnection(function(err,connection){
		if(err){
			console.log(err);
		}else if(connection && 'query' in connection){
			connection.query("UPDATE tblUser SET accountStatus=? WHERE confirmationToken=?",[status,token],function(err, rows, fields){
			var data = {
				"User":""
			};
			if(!!err){
				console.log(err);
				data["Users"] = "Registration is not confirmed";
				res.json(data);
			}else{
				data["Users"] = "Registration is confirmed";
				res.json(data);
			}
			});
			connection.release();
		}
			
	});	

});
//---------------------------------------------------------

function emailTokenToUser(user_token, user_email){
	var registrationConfirmationUrl = "http://localhost:1337/registration/confirmation";

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