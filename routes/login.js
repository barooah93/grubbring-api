var express = require('express');
var app = express.Router();

var passport = require('passport');

//binds node's passport library with our custom authentication written in passport.js
require('../config/passport.js')(passport);


//------------------------------------------------------------------------


app.get('/', function(req,res){
	console.log("User is entered into database and is returned to login page.");
	res.render('login');
});

//passport.authenticate will use local strategy to authenticate the user
//if succeeds, put a token for user in session state (passport.session()) in server.js
//subsequent requests will see the token, and automatically deserialize and make it available on req.user
app.post('/', passport.authenticate('local-login'), function(req,res){
	res.redirect('./profile');
});

module.exports = app;