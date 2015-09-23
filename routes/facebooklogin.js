var express = require('express');
var app = express.Router();
var passport = require('passport');
require('../config/passport.js')(passport);

app.get('/', passport.authenticate('facebook', {scope: ['email']}));

app.get('/callback', passport.authenticate('facebook', { successRedirect : '/api/profile',
                                                         failureRedirect : '/api/login' }));

module.exports = app;