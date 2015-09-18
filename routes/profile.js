var express = require('express');
var app = express.Router();

app.get('/',function(req,res){

	res.render('profile', {
		isAuthenticated:req.isAuthenticated(),
		user: req.user
	});

});


module.exports = app;