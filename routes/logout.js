var express = require('express');
var app = express.Router();
var debug = require('debug')('grubbring:logout');

app.get('/', function(req, res){
	var data = {
    		"status":"OK",
			"message":"User has been logged out"
		};
	req.logout(); //logout method added by passport, delete the user id inside sessions
	res.json(data);
});


module.exports = app;