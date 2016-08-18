var app = angular.module('grubbring.services');

app.service('GrubberyService', ['$http','MapCenterService', function($http,MapCenterService) {
    var nearbyGrubberies = [];
    
    return {
        ClearNearbyGrubberies: ClearNearbyGrubberies,
        
        //Service to: Return a list of nearby grubberies
        GetNearbyGrubberies: GetNearbyGrubberies
    }
    
    function ClearNearbyGrubberies() {
        nearbyGrubberies = null;
    }

    // Gets the grubberies near user and place on the map
    function GetNearbyGrubberies() {
        var mapCenter = MapCenterService.GetMapCenter();
        
        // get nearby grubberies to display to user
        return new Promise(function(resolve, reject) {
            if(nearbyGrubberies == null) {
                $http({
                    method: 'GET',
                    url: '/api/grubbery?latitude='+mapCenter.lat +'&longitude=' + mapCenter.long
                }).then(function(response) {
                    nearbyGrubberies = response.data.data;
                    if(response.data.status == StatusCodes.RETURNED_GRUBBERIES_NEAR_USER_SUCCESS) {
                        for(var i = 0; i < nearbyGrubberies.length; i++) {
                            nearbyGrubberies[i].isGrubbery = true;
                        }
                        resolve(nearbyGrubberies);
                    } else if(response.data.status == StatusCodes.NO_GRUBBERIES_NEAR_USER){
                        // TODO: display message to user to prompt them to be first to create a ring in their area
                        resolve([]);
                    } else {
                        // TODO: handle error
                        alert("We are experiencing issues trying to retrieve the grubberies around you. Please try again later.");
                        reject(response.data.description);
                    }
                }, function(err) {
                    reject(err);
                });
            } else {
                resolve(nearbyGrubberies);
            }
        });
    }
    
}]);