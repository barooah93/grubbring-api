var app = angular.module('grubbring.services');

app.service('RingService', ['$http','MapCenterService', function($http,MapCenterService) {
    
    var nearbyRings = null;

    return {
        
        // Service to call POST Method to create ring
        // Returns a promise with the response or error
        CreateRing : CreateRing,
        
        
        ClearNearbyRings: ClearNearbyRings,
        
        //Service to: Return a list of nearby rings
        GetNearbyRings: GetNearbyRings
        
    };
    
    function ClearNearbyRings() {
        nearbyRings = null;
    }
    
    // Function to populate list with nearby rings and display markers on map
    function GetNearbyRings(){
        var mapCenter = MapCenterService.GetMapCenter();
        
        // Flag used for asynchronous rendering of list
        //$scope.isWaitingOnNearbyRings = true; //TODO: add back in
                
        return new Promise(function(resolve, reject) {
            if(nearbyRings == null) {
                $http({
                    method: 'GET',
                    url: '/api/ring?latitude='+mapCenter.lat +'&longitude=' + mapCenter.long
                }).then(function(response) {
                    nearbyRings = response.data.data;
                    for(var i = 0; i < nearbyRings.length; i++) {
                        nearbyRings[i].isRing = true;
                    }
                    if(response.data.status == StatusCodes.RETURNED_RINGS_NEAR_USER_SUCCESS) {
                        resolve(nearbyRings);
                    } else if(response.data.status == StatusCodes.NO_RINGS_NEAR_USER){
                        // TODO: display message to user to prompt them to be first to create a ring in their area
                        resolve([]);
                    } else {
                        // TODO: handle error
                        alert("We are experiencing issues trying to retrieve the rings around you. Please try again later.");
                        reject(response.data.description);
                    }
                }, function(err) {
                    reject(err);
                });
            } else {
                resolve(nearbyRings); //don't call the service if data exists
            }
        });
    }
    
    function CreateRing(name, addr, city, state, zipcode, lat, long) {
            
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
                }).then(function(ring) {
                    if(ring.data.status == StatusCodes.CREATE_RING_SUCCESS) {
                        // TODO: Handle response
                        alert("Woohoo! You have just created a ring!");
                        resolve(ring);
                    } else if (ring.data.status == StatusCodes.NUMBER_OF_CREATED_RINGS_EXCEEDED_LIMIT) {
                        // User has reached ring creation limit
                        alert("You have reached the limit for how many rings you can create.  Please upgrade to our premium service if you would like to create more!");
                        reject(ring.data.status);
                    } else if(ring.data.status == StatusCodes.EXECUTED_QUERY_FAIL){
                        // Check if duplicate entry
                        if(ring.data.data.code == "ER_DUP_ENTRY"){
                            alert("There is already a ring with that name.");
                            reject(ring.data.data.code);
                        } else {
                            alert(ring.data.data.code);
                            reject(ring.data.data.code);
                        }
                    }
                }, function(err) {
                    reject(err);
                });
            });
        }
}]);