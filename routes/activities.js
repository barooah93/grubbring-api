var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;
var async = require('async');
var glog = require('../glog.js')('dashboard');
var db = require('../dbexecute');
var auth = require('../servicesAuthenticate');

/** variables **/



/**TODO:
1. GET A list of activities (both active and expired) that the user either initiated or was a part of
2. POST Create activity option where user will create order activity for certain ring
3. GET Search activities - allows you to search current and expired activites that user initiated or was a part of
4. GET View a specific activity's details by clicking on the activity panel on the screen
    
**/

app.get('/', function(req,res){
	
		auth.checkAuthentication(req,res, function(data){
    		res.json(req.user);	
    	});
    	
});