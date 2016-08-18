var app = angular.module('grubbring.services');

app.service('MapCenterService', [ function() {
    
    var mapCenter = { // contains lat long values used to find nearby rings, grubberies, etc.
        lat: "",
        long: ""
    }

    return {
        GetMapCenter : GetMapCenter,
        SetMapCenter: SetMapCenter
    };
    
    function GetMapCenter() {
        return mapCenter;
    }
    
    function SetMapCenter(center) {
        mapCenter = center;
    }
    
    
}]);