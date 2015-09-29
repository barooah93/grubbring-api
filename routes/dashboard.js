var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;
var user = null;

//GET functionality that will retrieve and display "current activity list" of rings if user is a part of at least one ring
 //“Current Activity in My Rings” should display a scrollable listing of open activities within the rings the user is a member of.  
 //Ring name, grubbringer name, grubbery, number of remaining openings for orders, and time left to place order - a button to “I’m IN” 
 //which when tapped should take user to View/Create Order screen.
app.get('/activity/current/:scope', function(req,res){
    
        //this is to display the current activity in the rings that the user created -- aka "Current Activity in My Rings"
        if (req.params.scope == 'myrings'){
            var query = null;
            var query2 = null;
            
            query = "SELECT userId FROM tblUser WHERE username = 'ringUser'"; // userid = 3 this is ringUser - hardcoded for now, will grab as session later
    
    // connect to db and execute query
    pool.getConnection(function(err,connection){
		if(err){
			console.log(err);
		}else if(connection && 'query' in connection){
			connection.query(query,function(err, rows, fields){
			    if(err){
			        console.log(err);
			    }
			    else{
			        //for (var i = 0; i < rows.length; i++){
			        console.log(rows[0]);
			        //res.send("Hooray!");
			    
			  }
			  user = rows[0];
			  
			  
			});
			
		
			query2 = "SELECT ringId FROM tblRingUser WHERE userId ='3' AND roleId = '1'"; //make userId dynamic when you figure out how to parse it
			connection.query(query2,function(err, rows, fields){
			    if(err){
			        console.log(err);
			    }
			    else{
			        //for (var i = 0; i < rows.length; i++){
			        console.log(rows[0]);
			        //console.log("what am i getting", user);
			        res.send("Hooray wooo!");
			    
			  }
			  
			  
			});
		connection.release();
		}
	});
            
        }
        
        //this is to display the current activity in the rings that the user is a part of -- aka "Current Activities I'm In"
        if (req.params.scope == 'otherrings'){
            
        }
    
});

module.exports = app;