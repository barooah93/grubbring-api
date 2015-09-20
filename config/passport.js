var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var encrypt = require('./passwordEncryption');
var pool = require('../config/dbconnection.js').pool;
var configAuth = require('./auth');

module.exports = function(passport){

	passport.serializeUser(function(user,done){
		done(null, user.userId);
	});

	passport.deserializeUser(function(id, done){
		pool.getConnection(function(err,connection){
			if(err){
				console.log(err);
			}else if(connection && 'query' in connection){
				connection.query("SELECT * from tblUser WHERE userId=?",[id],function(err,user,fields){
					if(user.length != 0){
						done(null,user[0]);
					}else{
						done(err,null);
					}
				});
				connection.release();  
			}
		});

	});
		

	//log-in using local strategy (keep session once user logs in)
	passport.use('local-login', new LocalStrategy(function(username, password, done){
		pool.getConnection(function(err,connection){
			if(err){
				console.log(err);
			}else if(connection && 'query' in connection){
				connection.query("SELECT * from tblUser WHERE username=?",[username],function(err,users,fields){
					if(users.length != 0){
						console.log("Data is returned");
						var db_username = users[0].username;
						var db_password = users[0].password;
						var db_status = users[0].accountStatus;

						if(username === db_username && encrypt.validatePassword(password,db_password) && db_status === "active"){
							console.log("User should be authorized");
							done(null, users[0]);
						}
						else{
							console.log("Incorrect password And/Or account is not activated.");
							done(err);
						}
					}else{
						done(err);
						console.log("This user does not exist.");
					}

				});
				connection.release();  
			}
		});
	}));
	
	passport.use(new FacebookStrategy({
	    clientID: configAuth.facebookAuth.clientID,
	    clientSecret: configAuth.facebookAuth.clientSecret,
	    callbackURL: configAuth.facebookAuth.callbackURL,
	    profileFields: ['id', 'name', 'emails']
	  },
	  function(accessToken, refreshToken, profile, done) {
	  	var loggedUser = null;
	    		pool.getConnection(function(err, connection) {
	    		    if(err){
	    		    	console.log(err);
	    		    	done(err);
	    		    }else if(connection && 'query' in connection){
	    		    	connection.query("SELECT * from tblUser WHERE username=?",[profile.id],function(err,users,fields){
	    		    		if(err){
	    		    			done(err);
	    		    		}
	    		    		else if(!users[0]){
	    		    			console.log("This facebook user doesn't have grubbring profile, add to database.");
	    		    			var username = profile.id;
	    		    			var firstName = profile.name.familyName;
	    		    			var lastName = profile.name.givenName;
	    		    			var email = profile.emails[0].value;
	    		    			var password = "abc123";
	    		    			var confirmationToken = "defaultToken";
	    		    			var status = "facebookUser";
	    		   
	    		    			connection.query("INSERT INTO tblUser (username,password,firstName,lastName,emailAddr,accountStatus,confirmationToken) VALUES (?,?,?,?,?,?,?)",[username,password,firstName,lastName,email,status,confirmationToken],function(err, user) {
	    		    			    if(err){
	    		    			    	done(err);
	    		    			    }
	    		    			    if(user){
	    		    			    	connection.query("SELECT * FROM tblUser ORDER BY userId DESC LIMIT 1",function(err, users){
	    		    			    		if(err){
	    		    			    			done(err);
	    		    			    		}else{
	    		    			    			done(null, users[0]);
	    		    			    		}
	    		    			    	});
	    		    			    }
	    		    			});
	  	    		    	}else{
	  	    		    		console.log("This facebook user has grubbring profile, login.");
	  	    		    		done(null, users[0]);
	  	    		    	}
	    		    		
	    		    	});
	    		    	connection.release();
	    		    }
	    		});
	    }
	));

}


		// pool.getConnection(function(err,connection){
		// 	if(err){
		// 		console.log(err);
		// 	}else if(connection && 'query' in connection){
		// 		connection.query("SELECT * from tblUser WHERE username=?",[username],function(err,user,fields){
					


					
		// 		});
		// 		connection.release();  
		// 	}
		// });