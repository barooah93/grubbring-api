var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var encrypt = require('./passwordEncryption');
var configAuth = require('./auth');
//var sendTokenEmail = require("../routes/registration");
var debug = require('debug')('grubbring:passport');
var db = require('../dbexecute');
var mysql = require('mysql');
var emailServices = require('../emailServices');

module.exports = function(passport){

	passport.serializeUser(function(user,done){
		done(null, user.userId);
	});

	passport.deserializeUser(function(id, done){
		
		var sql = null;
		sql = "SELECT * from tblUser WHERE userId=?;";
     	var inserts = [id];
     	sql = mysql.format(sql, inserts);
		db.dbExecuteQuery(sql,done,function(result){
			done(null,result.data[0]);
		});

	});

//----------------------------------------------------------------------------------------
	//log-in using local strategy (keep session once user logs in)
	passport.use('local-login', new LocalStrategy(function(username, password, done){
		var emailAddress = username;
		var sql = null;
		sql = "SELECT * from tblUser WHERE emailAddr=?;";
     	var inserts = [emailAddress];
     	sql = mysql.format(sql, inserts);
		
		db.dbExecuteQuery(sql, done, function(result) {
		    if(result.data.length > 0){//checks if username exists
				var db_password = result.data[0].password;
				var db_status = result.data[0].accountStatus;
				var db_loginAttempts = result.data[0].loginAttempts;
				var db_email = result.data[0].emailAddr;
				
				if(emailAddress === db_email && encrypt.validatePassword(password,db_password) && db_status === "active"){
						sql = "UPDATE tblUser SET loginAttempts=? WHERE emailAddr=?;";
						inserts = [3,emailAddress];
						sql = mysql.format(sql, inserts);
						
						db.dbExecuteQuery(sql, done, function(result) {
						    done(null,result.data[0]);
						});
						
						done(null, result.data[0]); 
				}
				else{
					db_loginAttempts--;
					if(db_loginAttempts == 0){
						//send email saying account is locked
						var newEmailObj = {
                        	emailAddress: db_email,
                        	subject: 'Grubbring - Too many unsuccessful login attempts',
                        	msg: 'Your account has been locked due to too many failed login attempts. Please reset your password.'
                    	};
          				emailServices.sendEmail(newEmailObj.msg, newEmailObj.subject, newEmailObj.emailAddress);
						sql = "UPDATE tblUser SET accountStatus=?, loginAttempts=? WHERE emailAddr=?;"
						inserts = ["Blocked",db_loginAttempts,db_email];
						sql=mysql.format(sql,inserts);
						
						db.dbExecuteQuery(sql,done,function(result) {
						   done(result.data[0]);
						});
						
						done(result.data[0]); 
					}
					else{
						if(db_loginAttempts < 0){
							db_loginAttempts = 0;
						}
						console.log(db_loginAttempts);
						sql = "UPDATE tblUser SET loginAttempts=? WHERE emailAddr=?;";
						inserts = [db_loginAttempts,emailAddress];
						sql = mysql.format(sql, inserts);
						
						db.dbExecuteQuery(sql, done, function(result) {
						    done(result.data[0]); //username exists but password is invalid OR account is inactive
						});
						
						done(result.data[0]); 
					}
					
				}
				
		    }else{
		    	console.log(emailAddress);
		    	done(result.data[0]); //username doesn't exist
		    }
		});
			
	}));
	
	//----------------------------------------------------------------------------------
	
	// //Login using Facebook Strategy
	// passport.use(new FacebookStrategy({
	//     clientID: configAuth.facebookAuth.clientID,
	//     clientSecret: configAuth.facebookAuth.clientSecret,
	//     callbackURL: configAuth.facebookAuth.callbackURL,
	//     profileFields: ['id', 'name', 'emails']
	//   },
	  
	//   function(accessToken, refreshToken, profile, done) {

	//   	async.waterfall([
	  		
	//   		function(callback){
	// 			pool.getConnection(function(err, connection) {
	// 			    if(err){
	// 			    	throw err;
	// 			    }
	// 			    if(connection && 'query' in connection){
	// 			    	callback(null,connection);
	// 			    }
	// 			});
	// 		},
			
	// 		function(connection, callback){
	// 			connection.query("SELECT * from tblUser WHERE username=?",[profile.id],function(err,users,fields){
	// 				if(err){
	// 					done(err);
	// 				}
	// 				else if(!users[0]){
	// 					console.log("This Facebook user doesn't have a grubbring profile. Add to database.");
	// 					callback(null,connection);
	// 				}
	// 				else{
	// 					console.log("This Facebook user already has a grubbring profile. User profile opened");
	// 					done(null, users[0]);
	// 					connection.release();
	// 				}
	// 			});
				
	// 		},
			
	// 		function(connection,callback){
	//     		var username = profile.id;
	//     		var firstName = profile.name.familyName;
	//     		var lastName = profile.name.givenName;
	//     		var email = profile.emails[0].value;
	//     		var password = "abc123";
	//     		var confirmationToken = "defaultToken";
	//     		var status = "facebookUser";
	//     		connection.query("INSERT INTO tblUser (username,password,firstName,lastName,emailAddr,accountStatus,confirmationToken) VALUES (?,?,?,?,?,?,?)",[username,password,firstName,lastName,email,status,confirmationToken],function(err, user){
	//     			if(err){
	//     				done(err);
	//     			}
	//     			if(user){
	//     				console.log("New Facebook user is added to grubbring database.")
	//     				callback(null, connection);
	//     			}
	//     		});
	// 		},
			
	// 		function(connection, callback){
	// 			connection.query("SELECT * FROM tblUser ORDER BY userId DESC LIMIT 1",function(err, users){
	// 				if(err){
	// 					done(err);
	// 				}	
	// 				else{
	// 					console.log("Return new Facebook user into grubbring.");
	// 					done(null,users[0]);
	// 				}
	// 			});
	// 			connection.release();
	// 		}
	  		
	//   	]);
	  	
	  	
	//     }
	// ));

//----------------------------------------------------------------------------------

}

