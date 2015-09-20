var express = require('express');
var app = express.Router();
var passport = require('passport');
require('../config/passport.js')(passport);

app.get('/', passport.authenticate('facebook', {scope: ['email']}));

app.get('/callback', passport.authenticate('facebook', { successRedirect : '/profile',
                                                         failureRedirect : '/login' }));

module.exports = app;