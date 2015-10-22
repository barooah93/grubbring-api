var express = require('express');
var app = express.Router();

var passport = require('passport');
var glog = require('../glog.js')('login');

//binds node's passport library with our custom authentication written in passport.js
require('../config/passport.js')(passport);


//------------------------------------------------------------------------


app.get('/', function(req,res){
    glog.log(req.method + ' ' + req.url);
	//res.render('login');
});

//passport.authenticate will use local strategy to authenticate the user
//if succeeds, put a token for user in session state (passport.session()) in server.js
//subsequent requests will see the token, and automatically deserialize and make it available on req.user
app.post('/', passport.authenticate('local-login'), function(req,res){
	glog.log(req.method + ' ' + req.url);
	if(req.user != null){
		res.status(200);
		res.json(req.user);
	}
});

module.exports = app;