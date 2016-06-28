// Dependencies
var express = require('express');
var app = express();
var gps = require('gps2zip');
var zipcodes = require('zipcodes');
var glog = require('../glog.js')('ring');
var db = require('../dbexecute');
var locationUtils = require('../Utilities/locationUtils');
var mysql = require('mysql');
var authenticate = require('../servicesAuthenticate')
var statusCodes = require('../Utilities/StatusCodesBackend');

//-------------------------START-----------------------------------------------------
// GET: get ring details for searched ring
/* Search fields:
    - ring name
    - ring ID
    - ring leader username
    - ring leader first name last name
*/
// ex: https://grubbring-api-barooah93.c9.io/api/ring/search/leaderName/my%20home%20ring
// wildcard search

/* Stephs Plan

Contextual Search Based Off Page User is On:

save original settings (if user backspaces out from the search show original) - future

if find rings: (purpose: find rings closest to your location)
    if user enters ring name: 
        return ( rings nearest user location || rings nearest location entered by user on UI) AND ( rings that satisfy the search params )
    else if user enters zip (is numeric and satisfies zip format):
        center map on the zip code entered in search
        return ( rings nearest zip )

if dashboard: (purpose: shows the rings you are in and your activities)
    if user enters in search bar:
        return ( rings that satisfy search AND grubberies that satisfy search )
*/

// ex: https://grubbring-api-barooah93.c9users.io/api/search/chip?context=dashboard&latitude=40%2E8804088&longitude=-74%2E6744209
app.get('/:key', function(req,res) {
    authenticate.checkAuthentication(req, res, function (data) {
        var ringSql = null; // sql statement to find key in ringIds or ring names
        var leaderSql = null; // sql statement to find key in leaderId or leader name
        var grubberySql=null;
        var userSql=null;
        var status = "";
        var description = "";
        var context = req.query.context;
        var key = req.params.key; // is already url decoded
        var tokenized = [];
        var firstName = null;
        var lastName = null;
        
        // Result objects
        var grubberyObject = null;
        var activityObject = null;
        var ringObject = null;
        
        // user's lat and long for finding grubberies near them
        var userLat = req.query.latitude;
        var userLong = req.query.longitude;
        var radius = req.query.radius;
        
        // set default lat long radius
/*        if(radius == null){
            radius = 2;
        }
        if(userLat == null){ //optum lat
            userLat = 40.7265190;
        }
        if(userLong == null){ //optum long
            userLong = -74.5441180;
        }*/
        
        // Replace multiple spaces with a single space and any tabs, endline symbols, etc.
        var cleanedSearchText = key.replace(/\s\s+/g, ' ');
        
        // tokenize key for multiple word search
        tokenized = cleanedSearchText.split(" ");
    
            var tokenizedSearch="";
            var inserts = [];
            
            // tokenize the search to look for each word in ring name
            for(var i=0;i<tokenized.length;i++){
                // check if last word in key
                if(i == tokenized.length-1) {
                    tokenizedSearch += "R.name LIKE ?";
                }
                else{
                    tokenizedSearch += "R.name LIKE ? AND "
                }
                inserts.push("%"+tokenized[i]+"%");
            }
            ringSql = "SELECT DISTINCT R.name, R.ringId, R.addr, R.city, R.state, R.zipcode, R.latitude, R.longitude, R.createdBy, "+
                "U.username, U.firstName, U.lastName, "+
                "(SELECT COUNT(*) FROM tblRingUser RU where RU.ringId = R.ringId AND RU.status=1) AS memberCount "+
                "FROM tblRing R, tblUser U "+
                "WHERE ("+tokenizedSearch+" AND U.userId=R.createdBy AND R.ringStatus=1);";
            ringSql = mysql.format(ringSql, inserts);
            db.dbExecuteQuery(ringSql,res, function(ringResult){
                var tokenizedSearch="";
                var inserts = [];
                
                // tokenize the search to look for each word in ring name
                for(var i=0;i<tokenized.length;i++){
                    // check if last word in key
                    if(i == tokenized.length-1) {
                        tokenizedSearch += "G.name LIKE ?";
                    }
                    else{
                        tokenizedSearch += "G.name LIKE ? AND "
                    }
                    inserts.push("%"+tokenized[i]+"%");
                }
                
                grubberySql = "SELECT G.name, G.grubberyId, G.addr, G.city, G.state, G.zipcode, G.latitude, G.longitude FROM tblGrubbery G WHERE "+tokenizedSearch+";";
                grubberySql = mysql.format(grubberySql,inserts);
                //execute
                db.dbExecuteQuery(grubberySql,res, function(grubberyResult){
                    if(ringResult.data.length == 0 && grubberyResult.data.length == 0){
                        status = statusCodes.SEARCH_RESULTS_NOT_FOUND;
                        description = "Could not match the search criteria with anything in our database.";
                    }
                    else{
                        status = statusCodes.SEARCH_RESULTS_FOUND;
                        description = "Returned matching searches";
                    }
                    var data = {
                        status: status, 
                        description: description, 
                        data: {
                            grubberies:grubberyResult.data,
                            rings:ringResult.data
                        }
                    }
                    
                    if(context == "findRings") {
                         if(userLat != null && userLong != null){ //sort by location
                            var sortedRings = locationUtils.getSortedObjectsByAddress(ringResult.data, userLat, userLong);
                            var sortedGrubberies = locationUtils.getSortedObjectsByAddress(grubberyResult.data, userLat, userLong);
                            data.data.rings = sortedRings;
                            data.data.grubberies = sortedGrubberies;
                            res.send(data);
                        }
                    }
                    else {
                        res.send(data);
                    }
                });
            });
            
            
/*            //search on grubberies
            locationUtils.getGrubberiesNearLocation(userLat, userLong, radius, res, function(result){
                // Loop through grubberies and find matches for the key
                var isMatched;
                var filteredArray =[]; //contains grubberies near location AND satisfy search
                if(result.data == null){
                    grubberyObject = {
                        status: "success",
                        description: "No grubberies near user that are found in search",
                        data: null
                    };
                } else{
                    for(var i=0; i<result.data.length; i++){
                        
                        // Initialize flag to true
                        isMatched = true;
                        
                        // Loop through each word in search
                        for(var j=0; j<tokenized.length; j++){
                           if(result.data[i].grubbery.toLowerCase().indexOf(tokenized[j].toLowerCase()) == -1){
                               isMatched = false;
                           }
                        }
                        if(isMatched){
                            filteredArray.push(result.data[i]);
                        }
                        
                    }
                    grubberyObject = {
                        status: "success",
                        description: "Grubberies near user and found in search",
                        data: filteredArray
                    };
                    
                    console.log(grubberyObject);
                }
            });
            
            //search on rings
            locationUtils.getRingsNearLocation(userLat, userLong, radius, res, function(result){
                // Loop through rings and find matches for the key
                var isMatched;
                var filteredArray =[]; //contains rings near location AND satisfy search
                if(result.data == null){
                    ringObject = {
                        status: "success",
                        description: "No rings near user and that are found in search",
                        data: null
                    };
                } else{
                    for(var i=0; i<result.data.length; i++){
                        
                        // Initialize flag to true
                        isMatched = true;
                        
                        // Loop through each word in search
                        for(var j=0; j<tokenized.length; j++){
                           if(result.data[i].name.toLowerCase().indexOf(tokenized[j].toLowerCase()) == -1){
                               isMatched = false;
                           }
                        }
                        if(isMatched){
                            filteredArray.push(result.data[i]);
                        }
                        
                    }
                    ringObject = {
                        status: "success",
                        description: "Rings near user and found in search",
                        data: filteredArray
                    };
                    
                    console.log(ringObject);
                }
            });
  */
            // var grubberySql = "SELECT G.name AS grubbery, G.addr, G.city, G.state, G.zipcode FROM tblGrubbery G ";
                // "INNER JOIN tblGrubbery G "+
                // "ON A.grubberyId = G.grubberyId "+
                // "INNER JOIN tblRing R "+
                // "ON A.ringId = R.ringId "+
                // "INNER JOIN tblUser U "+
                // "ON A.bringerUserId = U.userId "+
                // "INNER JOIN tblOrderUser OU "+
                // "ON OU.activityId=A.activityId ";
                
/*        }*/
/*        if(context == "findRings") {
            //search on rings
            locationUtils.getRingsNearLocation(userLat, userLong, radius, res, function(result){
                // Loop through rings and find matches for the key
                var isMatched;
                var filteredArray =[]; //contains rings near location AND satisfy search
                if(result.data == null){
                    ringObject = {
                        status: "success",
                        description: "No rings near user and that are found in search",
                        data: null
                    };
                } else {
                    for(var i=0; i<result.data.length; i++){
                        
                        // Initialize flag to true
                        isMatched = true;
                        
                        // Loop through each word in search
                        for(var j=0; j<tokenized.length; j++){
                           if(result.data[i].name.toLowerCase().indexOf(tokenized[j].toLowerCase()) == -1){
                               isMatched = false;
                           }
                        }
                        if(isMatched){
                            filteredArray.push(result.data[i]);
                        }
                        
                    }
                    ringObject = {
                        status: "success",
                        description: "Rings near user and found in search",
                        data: filteredArray
                    };
                    
                    console.log(ringObject);
                }
                //search on zips
                for(var tokenIndex = 0; tokenIndex<tokenized.length; tokenIndex++) {
                    if(locationUtils.isValidUSZip(tokenized[i])) {
                        //its a zip code
                        if(ringObject.data == null) {
                            //return rings nearest zip
                            
                        }
                    }
                }
            });

        }  */     
       // check the context of the search (each page might want to show results unique to that page)
/*        if(context == "myActivities"){
            
            grubberySql = sqlSelectStatement+"WHERE G.name LIKE ? AND U.userId = ?;";
            
            inserts = ["%"+key+"%",userId];
            grubberySql = mysql.format(grubberySql,inserts);
            glog.log(grubberySql);
            //execute
            db.dbExecuteQuery(grubberySql,res, function(grubberyResult){
                // TODO: tokenize multiple word search
                ringSql =sqlSelectStatement+"WHERE R.name LIKE ? AND U.userId = ?;";
                
                inserts = ["%"+key+"%", userId];
                ringSql = mysql.format(ringSql,inserts);
                // execute
                db.dbExecuteQuery(ringSql,res, function(ringResult){
                    userSql = sqlSelectStatement+"WHERE (U.username LIKE ? "+
                                "OR (U.firstName LIKE ? AND U.lastName LIKE ?) "+
                                "OR (U.lastName LIKE ? AND U.firstName LIKE ?)) AND U.userId = ?;";
                            
                    inserts = ["%"+key +"%", "%"+tokenized[0]+"%", "%"+tokenized[1]+"%","%"+tokenized[0]+"%", "%"+tokenized[1]+"%",userId];
                    userSql = mysql.format(userSql,inserts); 
                    // execute
                    db.dbExecuteQuery(userSql,res, function(userResult){
                        if(userResult.data.length ==0 && ringResult.data.length == 0 && grubberyResult.data.length == 0){
                            description = "Could not match the search criteria with anything in our database.";
                        }
                        else{
                            description = "Returned matching searches";
                        }
                        var data = {
                            status:'Success', 
                            description: description, 
                            data: {
                                grubberies:grubberyResult.data,
                                rings:ringResult.data,
                                users:userResult.data
                            }
                        };
                        res.send(data);
                    });
                });
            });
        }
        if(context == "findRings"){

            inserts = [key,"%"+key+"%"];
             
            // check if there are multiple words in key
            if(tokenized.length<2){
                tokenized[1]=""; // add blank string to second index if there is only one word in key so it is defined
            }
            else{ // tokenize the search to look for each word in ring name
                tokenizedSearch = "OR ( ";
                for(var i=0;i<tokenized.length;i++){
                    // check if last word in key
                    if(i == tokenized.length-1) {
                        tokenizedSearch += "R.name LIKE ?)";
                    }
                    else{
                        tokenizedSearch += "R.name LIKE ? AND "
                    }
                    inserts.push("%"+tokenized[i]+"%");
                }
            }
            
            // execute first sql to see if key is a ringId or ring name (partial or full)
            ringSql = "SELECT * FROM tblRing R WHERE ((R.ringId=? OR R.name LIKE ? "+tokenizedSearch+") AND R.ringStatus=1) ;";
            
            ringSql = mysql.format(ringSql, inserts);
            
            // execute first sql to see if key is a ringId or ring name (partial or full)
            // connect to db and execute sql
            db.dbExecuteQuery(ringSql,res, function(ringResult){
                // execute second sql to see if key is leaderId or leader's name
                leaderSql = "SELECT * FROM tblRing R "+
                "INNER JOIN tblUser U "+
                "ON R.createdBy=U.userId "+
                "WHERE (U.username LIKE ? "+
                    "OR (U.firstName LIKE ? AND U.lastName LIKE ?) "+
                    "OR (U.lastName LIKE ? AND U.firstName LIKE ?)) "+
                "AND R.ringStatus = 1;";
                inserts = ["%"+key +"%", "%"+tokenized[0]+"%", "%"+tokenized[1]+"%","%"+tokenized[0]+"%", "%"+tokenized[1]+"%"];
                leaderSql = mysql.format(leaderSql, inserts);
                
    //          connect and execute
                db.dbExecuteQuery(leaderSql,res, function(leaderResult){
                    if(leaderResult.data.length ==0 && ringResult.data.length == 0){
                        description = "Could not match the search criteria with anything in our database.";
                    }
                    else{
                        description = "Returned matching searches";
                    }
                    var data = {
                        status:'Success', 
                        description: description, 
                        data: {
                            rings:ringResult.data,
                            leaders:leaderResult.data
                        }
                    };
                    res.send(data);
                });
            });
        }*/
    });
    
});
//-------------------------END-------------------------------------------------------


//-------------------------Start----------------------------------------------------
// GET - Search by city, state or zipcode
// ex: https://grubbring-api-barooah93.c9users.io/api/search/locations?latitude=40%2E8804088&longitude=-74%2E6744209
app.get('/locations/:key', function(req,res) {
    // TODO: Return list of city,state and zipcodes that match their search
    var key = req.params.key;
    var userLat = req.query.latitude;
    var userLong = req.query.longitude;
    
});

//-------------------------END-------------------------------------------------------

module.exports = app;