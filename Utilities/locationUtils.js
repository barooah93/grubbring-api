var gps = require('gps2zip');
var nodeGeocoder = require('node-geocoder');
var geocoder = nodeGeocoder({provider: 'google'})
var zipcodes = require('zipcodes');
var mysql = require('mysql');
var db = require('../dbexecute');
var glog = require('../glog.js')('locationUtils');
var statusCodes = require('../Utilities/StatusCodesBackend');

module.exports = {    

    getSortedObjectsByAddress: function(objectArray, userLat, userLong) {
        var unsortedList = objectArray;
        var len = unsortedList.length;
        
        //sort objects by distance from user lat and long using insertion sort
        for (var i = 0; i < len; i++) {
            
            var currObject = unsortedList[i];
            var currDist = getDistanceFromLatLong(userLat, userLong, currObject.latitude, currObject.longitude);
            /*Check through the sorted list and compare with the unsorted ring if smaller, move the unsorted to the beginning of the list*/
            for (var j = i - 1; j >= 0 && (getDistanceFromLatLong(userLat, userLong, unsortedList[j].latitude, unsortedList[j].longitude) > currDist); j--) {
                unsortedList[j + 1] = unsortedList[j];
            }
            unsortedList[j + 1] = currObject;
        }
        
        return unsortedList;
    },
    
    getSortedObjectsByZipcodes: function(objectArray, userLat, userLong) {
        var userZipCode = gps.gps2zip(userLat, userLong).zip_code; 
        var unsortedList = objectArray;
        var len = unsortedList.length;
        
        //sort objects by distance from userZipCode using insertion sort
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
        //find zipcodes within a certain radius of user's zipcode
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
            // var sql = "SELECT R.addr, R.city, R.state, R.name, R.ringId, R.createdBy, R.zipcode, U.firstName, U.lastName" +
            // "FROM tblRing R "+
            // "INNER JOIN tblUser U "+
            // "ON R.createdBy=U.userId "+
            // "WHERE zipcode = ? AND R.ringStatus=1;";
            //SELECT DISTINCT R.addr, R.city, R.state, R.name, R.ringId, R.createdBy, R.zipcode, U.firstName, U.lastName, (SELECT COUNT(*) FROM tblRingUser RU INNER JOIN tblRing R WHERE RU.ringId=R.ringID) AS members FROM tblRing R, tblRingUser RU, tblUser U WHERE R.createdBy=U.userId  AND zipcode = '07852' AND R.ringStatus=1 AND RU.status=1
            //(SELECT COUNT(*) FROM tblRingUser where tblRingUser.ringId = tblRing.ringId) AS memberCount
            
            var sql = "SELECT DISTINCT R.addr, R.city, R.state, R.name, R.ringId, R.createdBy, R.zipcode, R.latitude, R.longitude, "+
                "U.firstName, U.lastName, "+
                "(SELECT COUNT(*) FROM tblRingUser RU where RU.ringId = R.ringId AND RU.status=1) AS memberCount "+
                "FROM tblRing R, tblUser U "+
                "WHERE R.createdBy=U.userId  "+
                "AND R.ringStatus=1 "+
                "AND (zipcode = ? ";
            
            var inserts = [zipcodesNearUser[0].toString()];
            // inject the rest
            for(var i=1;i<zipcodesNearUser.length;i++){
                sql+="OR zipcode = ? ";
                inserts.push(zipcodesNearUser[i].toString());
            }
            sql = sql + ");";
            
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
            var sql = "SELECT G.name, G.addr, G.city, G.state, G.zipcode, G.latitude, G.longitude, G.phone FROM tblGrubbery G "+
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

 // Using ‘Haversine’ formula (Needed again for use within file)
function getDistanceFromLatLong(lat1 ,long1 , lat2, long2){
    
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLong = deg2rad(long2-long1); 
    var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLong/2) * Math.sin(dLong/2)
    ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
    
    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }
}

function sortListByLatLong(unsortedList, userLat, userLong){
    var len = unsortedList.length;
    //sort objects by distance from user lat and long using insertion sort
    for (var i = 0; i < len; i++) {
        
        var currObject = unsortedList[i];
        var currDist = getDistanceFromLatLong(userLat, userLong, currObject.latitude, currObject.longitude);
        /*Check through the sorted list and compare with the unsorted ring if smaller, move the unsorted to the beginning of the list*/
        for (var j = i - 1; j >= 0 && (getDistanceFromLatLong(userLat, userLong, unsortedList[j].lat, unsortedList[j].long) > currDist); j--) {
            unsortedList[j + 1] = unsortedList[j];
        }
        unsortedList[j + 1] = currObject;
    }
    return unsortedList;
}