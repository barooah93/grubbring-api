var LocalStrategy = require('passport-local').Strategy;
var encrypt = require('./passwordEncryption');
var pool = require('../config/dbconnection.js').pool;

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