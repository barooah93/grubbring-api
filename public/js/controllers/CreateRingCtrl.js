angular.module('grubbring.controllers').controller('CreateRingCtrl', function createRingCtrl($scope, $http, $location, RingService) {
    $scope.showLoader = false;
    
    
    // Function to handle when create ring button is clicked
    function CreateRingButton_Clicked() {
        
        var name;
        var addr;
        var city;
        var state;
        var zipcode;
        var lat;
        var long;
        
        // TODO:
        // Error check the fields
        
        // TODO: 
        // Get a latitude and longitude from address
        
        var createRingPromise = RingService.CreateRing(name, addr, city, state, zipcode, lat, long);
        
        createRingPromise.then(function(response){
            
            // TODO: Handle response
            console.log(response.data);
            
        }, function(err){
            
            // TODO: Notify and log the error
            console.log(err);
        });
    }
});