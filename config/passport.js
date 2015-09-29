var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var encrypt = require('./passwordEncryption');
var pool = require('../config/dbconnection.js').pool;
var configAuth = require('./auth');
var async = require('async');
var debug = require('debug')('grubbring:passport');

module.exports = function(passport){

	passport.serializeUser(function(user,done){
		done(null, user.userId);
	});

	passport.deserializeUser(function(id, done){
		
		async.waterfall([
			
			function(callback){
				pool.getConnection(function(err, connection) {
				    if(err){
				    	throw err;
				    }
				    if(connection && 'query' in connection){
				    	callback(null,connection);
				    }
				});
			},

			function(connection,callback){
				connection.query("SELECT * from tblUser WHERE userId=?",[id],function(err,user,fields){
					if(err){
						throw err;
					}
					if(user.length != 0){
						done(null,user[0]);	
					}
				});
				connection.release();
			}
		]);

	});
	//----------------------------------------------------------------------------------

	//log-in using local strategy (keep session once user logs in)
	passport.use('local-login', new LocalStrategy(function(username, password, done){
		
		async.waterfall([
			
			function(callback){
				pool.getConnection(function(err, connection) {
				    if(err){
				    	throw err;
				    }
				    if(connection && 'query' in connection){
				    	callback(null,connection);
				    }
				});
			},
			
			function(connection, callback){
				connection.query("SELECT * from tblUser WHERE username=?",[username],function(err,users,fields){
					if(err){
						done(err);
					}
					if(users.length != 0){
						var db_username = users[0].username;
						var db_password = users[0].password;
						var db_status = users[0].accountStatus;
						
						if(username === db_username && encrypt.validatePassword(password,db_password) && db_status === "active"){
							debug('User should be authorized');
							// console.log("User should be authorized");
							done(null, users[0]);
						}
						else{
							debug('Incorrect password And/Or account is not activated.');
							console.log("Incorrect password And/Or account is not activated.");
							done(err);
						}
					}else{
						debug('This user does not exist.');
						done(err);
						// console.log("This user does not exist.");
					}
				});
				connection.release();
			}
			
		]);
			
	}));
	
	//----------------------------------------------------------------------------------
	
	//Login using Facebook Strategy
	passport.use(new FacebookStrategy({
	    clientID: configAuth.facebookAuth.clientID,
	    clientSecret: configAuth.facebookAuth.clientSecret,
	    callbackURL: configAuth.facebookAuth.callbackURL,
	    profileFields: ['id', 'name', 'emails']
	  },
	  
	  function(accessToken, refreshToken, profile, done) {

	  	async.waterfall([
	  		
	  		function(callback){
				pool.getConnection(function(err, connection) {
				    if(err){
				    	throw err;
				    }
				    if(connection && 'query' in connection){
				    	callback(null,connection);
				    }
				});
			},
			
			function(connection, callback){
				connection.query("SELECT * from tblUser WHERE username=?",[profile.id],function(err,users,fields){
					if(err){
						done(err);
					}
					else if(!users[0]){
						console.log("This Facebook user doesn't have a grubbring profile. Add to database.");
						callback(null,connection);
					}
					else{
						console.log("This Facebook user already has a grubbring profile. User profile opened");
						done(null, users[0]);
						connection.release();
					}
				});
				
			},
			
			function(connection,callback){
	    		var username = profile.id;
	    		var firstName = profile.name.familyName;
	    		var lastName = profile.name.givenName;
	    		var email = profile.emails[0].value;
	    		var password = "abc123";
	    		var confirmationToken = "defaultToken";
	    		var status = "facebookUser";
	    		connection.query("INSERT INTO tblUser (username,password,firstName,lastName,emailAddr,accountStatus,confirmationToken) VALUES (?,?,?,?,?,?,?)",[username,password,firstName,lastName,email,status,confirmationToken],function(err, user){
	    			if(err){
	    				done(err);
	    			}
	    			if(user){
	    				console.log("New Facebook user is added to grubbring database.")
	    				callback(null, connection);
	    			}
	    		});
			},
			
			function(connection, callback){
				connection.query("SELECT * FROM tblUser ORDER BY userId DESC LIMIT 1",function(err, users){
					if(err){
						done(err);
					}	
					else{
						console.log("Return new Facebook user into grubbring.");
						done(null,users[0]);
					}
				});
				connection.release();
			}
	  		
	  	]);
	  	
	  	
	    }
	));

//----------------------------------------------------------------------------------

}

