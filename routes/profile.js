var express = require('express');
var app = express.Router();
var debug = require('debug')('grubbering:profile');

app.get('/',function(req,res){
	debug(req.method + ' ' + req.url);
	res.render('profile', {
		isAuthenticated:req.isAuthenticated(),
		user: req.user
	});

});


module.exports = app;