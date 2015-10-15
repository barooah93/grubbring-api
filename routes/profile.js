var express = require('express');
var app = express.Router();
var debug = require('debug')('grubbring:profile');
var pool = require('../config/dbconnection.js').pool;
var encrypt = require('../config/passwordEncryption.js');

app.get('/',function(req,res){
	if(req.isAuthenticated() == true){
		debug("Profile response executed");
		res.status(200);
		res.json(req.user);
	}else{
		debug("There is no user on session");
		var data = {
    		"status":"UNAUTHORIZED",
			"message":"Please login using correct username and password"
		};
		res.status(401);
		res.json(data);
	}
	
});

app.post('/updateEmail', function(req, res) {
	debug(req.method + ' ' + req.url);
	
	var currEmail = req.user.emailAddr;
	var newEmail = req.body.newEmail;
	var userId = req.user.userId;
	
	if (!newEmail || currEmail === newEmail) {
		debug('Email field was empty or the same email address was entered');
	} else {
		pool.getConnection(function(err, connection) {
			if (err) {
				console.log(err);
			} else {
				connection.query('UPDATE tblUser SET emailAddr=? WHERE userId=?', [newEmail, userId], function(err, rows) {
					if (err) {
						console.log(err);
					} else {
						debug('Updated email address');
					}
				});
				connection.release();
			}
		});
	}
	res.redirect('back');
});

app.post('/updateCellNumber', function(req, res) {
	debug(req.method + ' ' + req.url);
	
	var currCell = req.user.cellPhone;
	var newCell = req.body.newCell;
	var userId = req.user.userId;
	
	if (!newCell || currCell === newCell) {
		debug('Cell number field was empty or the same number was entered');
	} else {
		pool.getConnection(function(err, connection) {
			if (err) {
				console.log(err);
			} else {
				connection.query('UPDATE tblUser SET cellPhone=? WHERE userId=?', [newCell, userId], function(err, rows) {
					if (err) {
						console.log(err);
					} else {
						debug('Updated Cell number');
					}
				});
				connection.release();
			}
		});
	}
	res.redirect('back');
});

app.post('/updatePassword', function(req, res) {
	debug(req.method + ' ' + req.url);
	
	var oldPassword = req.body.oldPassword;
	var newPassword = req.body.newPassword;
	var confirmPassword = req.body.confirmPassword;
	var oldHash = req.user.password;
	var userId = req.user.userId;
	
	if (newPassword && oldPassword != newPassword && newPassword === confirmPassword && encrypt.validatePassword(oldPassword, oldHash)) {
		pool.getConnection(function(err, connection) {
			if (err) {
				console.log(err);
			} else {
				var newHash = encrypt.generateHash(newPassword);
				connection.query('UPDATE tblUser SET password=? WHERE userId=?', [newHash, userId], function(err, rows) {
					if (err) {
						console.log(err);
					} else {
						debug('Updated password');
					}
				});
				connection.release();
			}
		});
	} else {
		debug('One of the conditions have failed.');
	}
	res.redirect('back');
})

module.exports = app;