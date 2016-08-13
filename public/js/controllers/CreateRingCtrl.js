angular.module('grubbring.controllers').controller('CreateRingCtrl', function createRingCtrl($scope, $http, $location, RingService, LocationService) {
    $scope.showLoader = false;
    
    
    // Function to handle when create ring button is clicked
    $scope.CreateRingButton_Clicked = function(){
        
        var name = $scope.ringName;
        var addr = $scope.ringAddress;
        var city = $scope.ringCity;
        var state = $scope.ringState;
        var zipcode = $scope.ringZipcode;
        var lat;
        var long;
        
        // TODO:
        // Error check the fields
        
        // Get lat and long of the address
        var fullAddress = addr + " " + city + ", " + state;
        var convertToLocationPromise = LocationService.ConvertAddressToLatLong(fullAddress);
        
        convertToLocationPromise.then(function(locationResponse){

            var createRingPromise = RingService.CreateRing(name, addr, city, state, zipcode, locationResponse.lat(), locationResponse.lng());
            
            createRingPromise.then(function(ringResponse){
                
                if(ringResponse.data.status == StatusCodes.CREATE_RING_SUCCESS) {
                    // TODO: Handle response
                    console.log(ringResponse.data);
                    alert("Woohoo! You have just created a ring!");
                } else if (ringResponse.data.status == StatusCodes.NUMBER_OF_CREATED_RINGS_EXCEEDED_LIMIT) {
                    // User has reached ring creation limit
                    alert("You have reached the limit for how many rings you can create.  Please upgrade to our premium service if you would like to create more!");
                
                } else if(ringResponse.data.status == StatusCodes.EXECUTED_QUERY_FAIL){
                    // Check if duplicate entry
                    if(ringResponse.data.data.code == "ER_DUP_ENTRY"){
                        alert("There is already a ring with that name.");
                    } else {
                        alert(ringResponse.data.data.code);
                    }
                }
            
            }, function(err){
                
                // TODO: Notify and log the error
                console.log(err);
            });
        }, function(err){
            
            // TODO: Handle error
            console.log(err);
        });
        
        
        
        
    }
});