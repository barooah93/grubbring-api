var express = require('express');
var app = express.Router();
var debug = require('debug')('grubbring:profile');
var pool = require('../config/dbconnection.js').pool;

app.get('/',function(req,res){
	debug(req.method + ' ' + req.url);
	res.render('profile', {
		isAuthenticated:req.isAuthenticated(),
		user: req.user
	});
});

app.post('/updateEmail', function(req, res) {
	debug(req.method + ' ' + req.url);
	
	var currEmail = req.user.emailAddr;
	var newEmail = req.body.newEmail;
	
	if (!newEmail || currEmail === newEmail) {
		debug('Email field was empty or the same email address was entered');
	} else {
		pool.getConnection(function(err, connection) {
			if (err) {
				console.log(err);
			} else {
				connection.query('UPDATE tblUser SET emailAddr=? WHERE emailAddr=?', [newEmail, currEmail], function(err, rows) {
					if (err) {
						console.log(err);
					} else {
						debug('Updated email address');
					}
				})
				connection.release();
			}
		})
	}
	res.redirect('back');
})

module.exports = app;