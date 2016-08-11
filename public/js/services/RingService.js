var app = angular.module('grubbring.RingServices', []);

app.service('RingService', function($http) {

    return {
        
        // Service to call POST Method to create ring
        // Returns a promise with the response or error
        CreateRing : function(name, addr, city, state, zipcode, lat, long) {
            
            // The promise to be returned
            return new Promise(function(resolve, reject){
                
                // The POST data
                var bodyData = {
                    name : name,
                    addr : addr,
                    city : city,
                    state : state,
                    zipcode : zipcode,
                    latitude : lat,
                    longitude : long
                };
                
                $http({
                    method: 'POST',
                    url: '/api/ring',
                    data: bodyData
                }).then(function(response) {
                    resolve(response);
                }, function(err) {
                    reject(err);
                });
            });
        }
    };
});