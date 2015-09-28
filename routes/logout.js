var express = require('express');
var app = express.Router();
var debug = require('debug')('grubbering:logout');

app.get('/', function(req, res){
	debug(req.method + ' ' + req.url);
	req.logout(); //logout method added by passport, delete the user id inside sessions
	res.redirect('/api/login');
});


module.exports = app;