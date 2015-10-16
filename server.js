var express = require('express');
var app = express();
//var http = require('http').Server(app);

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var passport = require('passport');

var debug = require('debug')('grubbring');

//Routes to specified APIs based on requested URLs
var usersRoute = require('./routes/users');
var loginRoute = require('./routes/login');
var profileRoute = require('./routes/profile');
var logoutRoute = require('./routes/logout');
var registrationRoute = require('./routes/registration');
var facebookloginRoute = require('./routes/facebooklogin');
var getRingsRoute = require('./routes/ring'); 
var getDashboardRoute = require("./routes/dashboard");

//var connectAccountsRoute = require('./routes/connectAccounts');

//-----------------------------------------------------------
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser()); //cookie parser stores sessionID in browser
app.use(expressSession({ //server-side storage of user IDs
	secret: 'secret',
	resave: false,
	saveUninitialized: false
 }));

//telling app to use passport middleware ; adding passport to app
app.use(passport.initialize());
app.use(passport.session());


//-----------------------------------------------------------------
//Re-Route URL Requests
app.use('/api/login', loginRoute);
app.use('/api/profile', profileRoute);
app.use('/api/logout', logoutRoute);
app.use('/api/registration', registrationRoute);
app.use('/auth/facebook', facebookloginRoute);
//app.use('/connect', connectAccountsRoute);

//Re-Routing URL requests to APIs
app.use('/api/users', usersRoute);
app.use('/api/ring', getRingsRoute);
app.use('/api/dashboard', getDashboardRoute);

app.use('/*', function(req, res) {
   res.render('index');
});


//-------------------------------------------------
//Server
//http.listen(process.env.PORT, process.env.IP, function(){
//	console.log("Connected & Listen to port", process.env.PORT);
//});
app.listen(process.env.PORT, process.env.IP, function() {
	debug('Connected & listening to port ' + process.env.PORT);
	console.log("Connected & listening to port ", process.env.PORT);
})