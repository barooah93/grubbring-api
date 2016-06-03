var gps = require('gps2zip');
var zipcodes = require('zipcodes');
var mysql = require('mysql');
var db = require('../dbexecute');
var glog = require('../glog.js')('locationUtils');
var statusCodes = require('../Utilities/StatusCodesBackend');

module.exports = {    

    getSortedObjectsByZipcodes: function(ringObjectArray, userLat, userLong) {
        var userZipCode = gps.gps2zip(userLat, userLong).zip_code; 
        var unsortedList = ringObjectArray;
        var len = unsortedList.length;
        
        //sort rings by distance from userZipCode using insertion sort
        for (var i = 0; i < len; i++) {
            var currRing = unsortedList[i];
            var currDist = zipcodes.distance(currRing.zipcode, userZipCode); //In Miles
            /*Check through the sorted list and compare with the unsorted ring if smaller, move the unsorted to the beginning of the list*/
            for (var j = i - 1; j >= 0 && (zipcodes.distance(unsortedList[j].zipcode,userZipCode) > currDist); j--) {
                unsortedList[j + 1] = unsortedList[j];
            }
            unsortedList[j + 1] = currRing;
        }
        
        return unsortedList;
    },
    
    isValidUSZip: function(zip) {
        //TODO: check if zip is in range of us zip code numbers
        return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip);
    },
    
    getRingsNearLocation: function(lat, long, radius, res, callback){
         //get zipcode based on lat and log
        var userZipCode = gps.gps2zip(lat, long).zip_code; 
        //find zipcodes within a certain radius (2 mile) of user's zipcode
        var zipcodesNearUser = zipcodes.radius(userZipCode, radius);
        // Check if zipcodes were returned
        if(!zipcodesNearUser.length>0){
            glog.error("No zipcodes returned for latitude: "+lat+" longitude: "+long);
            var response = {
                status: statusCodes.RETRIEVE_USER_LOCATION_FAIL,
                description: "No zipcodes returned for latitude: "+lat+" longitude: "+long,
                data: null
            }
            
            callback(response);
        }
        else{
            // inject first zipcode into sql
            var sql = "SELECT R.addr, R.city, R.state, R.name, R.ringId, U.firstName, U.lastName FROM tblRing R "+
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
            
            db.dbExecuteQuery(sql, res, function(result){
                if(result.data.length > 0){
                    // overwrite description
                    result.status=statusCodes.RETURNED_RINGS_NEAR_USER_SUCCESS;
                    result.description="Returned all rings";
                } else {
                    result.status=statusCodes.NO_RINGS_NEAR_USER;
                    result.description="Returned no rings";
                }
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
                status: statusCodes.RETRIEVE_USER_LOCATION_FAIL,
                description: "No zipcodes returned for latitude: "+lat+" longitude: "+long,
                data: null
            }
            
            callback(response);
        }
        else{
            // inject first zipcode into sql
            var sql = "SELECT G.name, G.addr, G.city, G.state, G.zipcode FROM tblGrubbery G "+
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
                if(result.data.length > 0){
                    // overwrite description
                    result.status= statusCodes.RETURNED_GRUBBERIES_NEAR_USER_SUCCESS;
                    result.description="Returned all grubberies";
                } else {
                    result.status=statusCodes.NO_GRUBBERIES_NEAR_USER;
                    result.description="Returned no grubberies";
                    
                }
                
                
                callback(result);
            });
        }
    }
}