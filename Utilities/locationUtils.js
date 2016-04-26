var gps = require('gps2zip');
var zipcodes = require('zipcodes');
var mysql = require('mysql');
var db = require('../dbexecute');
var glog = require('../glog.js')('locationUtils');

module.exports = {    
    
    getRingsNearLocation: function(lat, long, radius, res, callback){
         //get zipcode based on lat and log
        var userZipCode = gps.gps2zip(lat, long).zip_code; 
        //find zipcodes within a certain radius (2 mile) of user's zipcode
        var zipcodesNearUser = zipcodes.radius(userZipCode, radius);
        // Check if zipcodes were returned
        if(!zipcodesNearUser.length>0){
            glog.error("No zipcodes returned for latitude: "+lat+" longitude: "+long);
            var response = {
                status: "error",
                description: "No zipcodes returned for latitude: "+lat+" longitude: "+long,
                data: null
            }
            
            callback(response);
        }
        else{
            // inject first zipcode into sql
            var sql = "SELECT R.addr, R.city, R.state, R.name, U.firstName, U.lastName FROM tblRing R "+
            "INNER JOIN tblUser U "+
            "ON R.createdBy=U.userId "+
            "WHERE zipcode = ? ";
            var inserts = [zipcodesNearUser[0].toString()];
            // inject the rest
            for(var i=1;i<zipcodesNearUser.length;i++){
                sql+="OR zipcode = ? ";
                inserts.push(zipcodesNearUser[i].toString());
            }
            sql = sql + ";";
            
            sql = mysql.format(sql, inserts);
            console.log("the sql statement for ring with lat long: " + sql);
            
            db.dbExecuteQuery(sql, res, function(result){
                // overwrite description
                result.description="Returned all rings";
                callback(result);
            });
        }
    },

    getGrubberiesNearLocation: function(lat, long, radius, res, callback){
        //get zipcode based on lat and log
        var userZipCode = gps.gps2zip(lat, long).zip_code; 
        //find zipcodes within a certain radius (2 mile) of user's zipcode
        var zipcodesNearUser = zipcodes.radius(userZipCode, radius);
        // Check if zipcodes were returned
        if(!zipcodesNearUser.length>0){
            glog.error("No zipcodes returned for latitude: "+lat+" longitude: "+long);
            var response = {
                status: "error",
                description: "No zipcodes returned for latitude: "+lat+" longitude: "+long,
                data: null
            }
            
            callback(response);
        }
        else{
            // inject first zipcode into sql
            var sql = "SELECT G.name AS grubbery, G.addr, G.city, G.state, G.zipcode FROM tblGrubbery G "+
            "WHERE zipcode = ? ";
            var inserts = [zipcodesNearUser[0].toString()];
            // inject the rest
            for(var i=1;i<zipcodesNearUser.length;i++){
                sql+="OR zipcode = ? ";
                inserts.push(zipcodesNearUser[i].toString());
            }
            sql = sql + ";";
            
            sql = mysql.format(sql, inserts);
            
            db.dbExecuteQuery(sql, res, function(result){
                // overwrite description
                result.description="Returned all grubberies";
                callback(result);
            });
        }
    }
}