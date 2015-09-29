var express = require('express');
var app = express.Router();
var async = require('async');
var debug = require('debug')('grubbering:users');

//put dbconnection.js into root directory and remove it from routes/
//require(dbconnection from root directory)
var pool = require('../config/dbconnection.js').pool;

//get all users
app.get('/',function(req,res){
	debug(req.method + ' ' + req.url);
	var data = {
		"Users":""
	};
	async.waterfall([
		
		function(callback){
			pool.getConnection(function(err,connection){
				if(err){
					throw err;
				}
				if(connection && 'query' in connection){
					callback(null,connection);
				}
			});
		},
		
		function(connection, callback){
			connection.query("SELECT * from tblUser",function(err,rows,fields){
				if(err){
					throw err;
				}
				if(rows.length != 0){
					data["Users"] = rows;
					res.json(data);
				}
			});
			connection.release();
		}
	]);
	
});

// //get user by id
// app.get('/:id',function(req,res){
// 	var Id = req.params.id;
// 	console.log(Id);
// 	var data = {
// 		"User":""
// 	};
// 	if(!!Id){
// 		connection.query("SELECT * FROM userTable WHERE user_id=?",[Id],function(err,rows,fields){
// 			if(!!err){
// 				data["User"] = "Error getting data";
// 				res.json(data);
// 			}else{
// 				res.json(rows);
// 			}
// 		});
// 	}else{
// 		data["User"] = "Please provide all required data such as id";
// 		res.json(data);
// 	}
// });

// //add new user
// app.post('/',function(req,res){
// 	var Username = req.body.username;
// 	var PassWord = req.body.password;
// 	var Email = req.body.email;
// 	var data = {
// 		"Users":""
// 	};
// 	if(!!Username && !!PassWord && !!Email){
// 		connection.query("INSERT INTO userTable VALUES('',?,?,?)",[Username,PassWord, Email],function(err, rows, fields){
// 			if(!!err){
// 				data["Users"] = "Error Adding data";
// 			}else{
// 				data["Users"] = "User Added Successfully";
// 			}
// 			res.json(data);
// 		});
// 	}else{
// 		data["Users"] = "Please provide all required data (i.e : Username, PassWord, Email)";
// 		res.json(data);
// 	}
// });

// //update a user
// app.put('/',function(req,res){
// 	var Id = req.body.user_id;
// 	var Username = req.body.username;
// 	var PassWord = req.body.password;
// 	var Email = req.body.email;
// 	var data = {
// 		"Users":""
// 	};
// 	if(!!Id && !!Username && !!PassWord && !!Email){
// 		connection.query("UPDATE userTable SET username=?, password=?, email=? WHERE user_id=?",[Username,PassWord,Email,Id],function(err, rows, fields){
// 			if(!!err){
// 				data["Users"] = "Error Updating data";
// 			}else{
// 				data["Users"] = "Updated User Successfully";
// 			}
// 			res.json(data);
// 		});
// 	}else{
// 		data["Users"] = "Please provide all required data";
// 		res.json(data);
// 	}
// });

// //delete a user
// app.delete('/:id',function(req,res){
// 	var Id = req.params.id;
// 	var data = {
// 		"Users":""
// 	};
// 	if(!!Id){
// 		connection.query("DELETE FROM userTable WHERE user_id=?",[Id],function(err, rows, fields){
// 			if(!!err){
// 				data["User"] = "Error deleting data";
// 			}else{
// 				data["User"] = "Delete User Successfully";
// 			}
// 			res.json(data);
// 		});
// 	}else{
// 		data["Users"] = "Please provide all required data (i.e : id )";
// 		res.json(data);
// 	}
// });

module.exports = app;
