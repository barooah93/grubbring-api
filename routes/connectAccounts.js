// var express = require('express');
// var app = express.Router();
// var passport = require('passport');
// require('../config/passport.js')(passport);


//  // locally --------------------------------
// app.get('/local', function(req, res) {
//     res.render('connect-local.ejs', { message: req.flash('loginMessage') });
// });
// app.post('/local', passport.authenticate('local-signup', {
//     successRedirect : '/profile', // redirect to the secure profile section
//     failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
//     failureFlash : true // allow flash messages
// }));

// // send to facebook to do the authentication
// app.get('/facebook', passport.authorize('facebook', { scope : 'email' }));

// // handle the callback after facebook has authorized the user
// app.get('/facebook/callback',
//     passport.authorize('facebook', {
//         successRedirect : '/profile',
//         failureRedirect : '/'
//      }));