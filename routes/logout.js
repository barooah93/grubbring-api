var express = require('express');
var app = express.Router();

app.get('/', function(req, res){
	req.logout(); //logout method added by passport, delete the user id inside sessions
	res.redirect('/login');
});


module.exports = app;