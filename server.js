var app   = require('express')();
var http = require('http').Server(app);

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var passport = require('passport');
var passportLocal = require('passport-local');


//Routes to specified APIs based on requested URLs
var usersRoute = require('./routes/users');
var loginRoute = require('./routes/login');
var profileRoute = require('./routes/profile');
var logoutRoute = require('./routes/logout');
var registrationRoute = require('./routes/registration');
var facebookloginRoute = require('./routes/facebooklogin');

//-----------------------------------------------------------
app.set('view engine', 'ejs');

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
app.use('/login', loginRoute);
app.use('/profile', profileRoute);
app.use('/logout', logoutRoute);
app.use('/registration', registrationRoute);
app.use('/auth/facebook', facebookloginRoute);

//Re-Routing URL requests to APIs
app.use('/users', usersRoute);


//-------------------------------------------------
//Server
http.listen(process.env.PORT,function(){
	console.log("Connected & Listen to port", process.env.PORT);
});