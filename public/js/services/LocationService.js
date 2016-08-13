var app = angular.module('grubbring.services');

app.service('LocationService', function(){
    
    return {
        
        // Takes in a string of an address
        // Returns promise with object containing lat, lng
        ConvertAddressToLatLong : function(address){
            
            return new Promise(function(resolve, reject){
                
                // Initialize geocoder
                var geocoder = new google.maps.Geocoder();
                
                // Geocode given address
                geocoder.geocode( { "address": address }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                        var location = results[0].geometry.location;
                        resolve(location);
                    } else {
                        // TODO: Handle different status errors
                        reject(status);
                    }
                });
            });
        }
    };
});