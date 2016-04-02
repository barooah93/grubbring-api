var app = angular.module('grubbring.services', []);

app.service('passEmailService', function() {
    var email = "";
    return {
        getEmail: function() {
            return email;
        },
        setEmail: function(value) {
            email = value;
        }
    };
});

app.service('passAccessCode', function() {
    var accessCode = "";
    return {
        getAccessCode: function() {
            return accessCode;
        },
        setAccessCode: function(value) {
            accessCode = value;
        }
    };
});

app.factory('Password', function() {
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

})

