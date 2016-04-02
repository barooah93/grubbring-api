(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {

    function getStrength(pass) {
        var score = 0;
        if (!pass)
            return score;

        // award every unique letter until 5 repetitions
        var letters = new Object();
        for (var i = 0; i < pass.length; i++) {
            letters[pass[i]] = (letters[pass[i]] || 0) + 1;
            score += 5.0 / letters[pass[i]];
        }

        // bonus points for mixing it up
        var variations = {
            digits: /\d/.test(pass),
            lower: /[a-z]/.test(pass),
            upper: /[A-Z]/.test(pass),
            nonWords: /\W/.test(pass),
        }

        var variationCount = 0;
        for (var check in variations) {
            variationCount += (variations[check] == true) ? 1 : 0;
        }
        score += (variationCount - 1) * 10;

        if (score > 100) score = 100;

        return parseInt(score);
    }

    // Password strength display message
    function getMessage(strength) {
        if (strength != 0) {
            if (strength < 40) {
                return "Weak";
            } else if (strength <= 70) {
                return "Medium";
            } else {
                return "Strong";
            }
        } else {
            return "";
        }
    }

    return {
        getStrength: function(pass) {
            return getStrength(pass);
        },
        getMessage: getMessage
    }

};

},{}],2:[function(require,module,exports){
angular.module('grubbring.factories', [])
    .factory('Password', require('./Password'))

},{"./Password":1}]},{},[2]);
