var express = require('express');
var app = express();
var pool = require('../config/dbconnection.js').pool;


//GET functionality that will retrieve and display "current activity list" of rings if user is a part of at least one ring
 //“Current Activity in My Rings” should display a scrollable listing of open activities within the rings the user is a member of.  
 //Ring name, grubbringer name, grubbery, number of remaining openings for orders, and time left to place order - a button to “I’m IN” 
 //which when tapped should take user to View/Create Order screen.
app.get('p/tagId', function(req, res) {
  res.send("tagId is set to " + req.params.tagId);
});

module.exports = app;