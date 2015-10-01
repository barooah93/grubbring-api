var express = require('express');
var app = express();
//var arraylist = require('arraylist');
var pool = require('../config/dbconnection.js').pool;
var user = null;
var ringid = null;
var currlist;
var finallist;

var myRingsActivity = {
	ringName: "tbd",
	grubbringerName: "tbd",
	grubbery: "tbd"
}

//GET functionality that will retrieve and display "current activity list" of rings if user is a part of at least one ring
 //“Current Activity in My Rings” should display a scrollable listing of open activities within the rings the user is a member of.  
 //Ring name, grubbringer name, grubbery, number of remaining openings for orders, and time left to place order - a button to “I’m IN” 
 //which when tapped should take user to View/Create Order screen.
app.get('/activity/current/:scope', function(req,res){
    
        //this is to display the current activity in the rings that the user created -- aka "Current Activity in My Rings"
        if (req.params.scope == 'myrings'){
            var query = null;
            var query2 = null;

            query = "SELECT userId FROM tblUser WHERE username = 'mzayed'"; // userid = 2 this is ringUser - hardcoded for now, will grab as session later
    
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
			  user = rows[0].userId;
			  console.log("now we have this data", user);
			  
			  //now we're checking the list of ring(s) in which the logged in user is currently an active member of
			query2 = "SELECT ringId FROM tblRingUser WHERE userId ='"+user+"' AND roleId = '0'"; 
			connection.query(query2,function(err, rows, fields){
			    if(err){
			        console.log(err);
			    }
			    else{
			        console.log(rows[0]);
			        //console.log("what am i getting", user);
			        res.send("Hooray wooo!");
			        
			        for (var i = 0; i < rows.length; i++) {
    					ringid = rows[i].ringId;
    					//currlist.add(ringid);
    					console.log("how many times do I display ringid", ringid);
				
				//now that we have the ringids in a list, we can start constructing our POC list view - ring name, grubbringer name, and grubbery (listed)
				//as list gets bigger, will create an object class that contains the necessary data
				connection.query("SELECT DISTINCT name, ringStatus, username FROM tblRing, tblUser WHERE ringId = '"+ringid+"' AND userId = '"+user+"'",function(err, rows, fields){
			    if(err){
			        console.log(err);
			    }
			    else{
			        console.log(rows[0]);
			        //console.log("what am i getting", user);
			        
			        
			        for (var i = 0; i < rows.length; i++) {
			        	console.log(rows[i]);
    					
					}
					//res.send("Final output!");
			    
			  }
			  
			  
			  
			});
				
    					
					}
			  }
			  
			  
			  
			});
			
			
			
			
			 
			
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