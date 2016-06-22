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

// GET: pull all grubbery locations and details near the user. If no grubberies found, send error code
app.get('/', function(req,res){
     authenticate.checkAuthentication(req, res, function (data) {
        /*
        Latitude and Longitude of user comes from front end and passed in the query params of this http GET request
        For website - browser can get user's coordiates --> Example: http://www.w3schools.com/html/html5_geolocation.asp
        For Android/IOS - use mobiles geolocation api to get user's coordinates and pass to this api
        */
        var userLat = req.query.latitude;
        var userLong = req.query.longitude;
        locationUtils.getGrubberiesNearLocation(userLat, userLong, 3, res, function(result){
            var sortedGrubberies = locationUtils.getSortedObjectsByAddress(result.data, userLat, userLong);
            result.data = sortedGrubberies;
            res.send(result);
        });

    });
});
//-------------------------END-------------------------------------------------------

module.exports = app;