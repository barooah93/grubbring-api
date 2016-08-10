var app = angular.module('grubbring.RingServices', []);

app.service('RingService', function($http) {

    var email = "hey";
    return {
        CreateRing: function(name) {
            return "Hi " + email;
        }
    };
});