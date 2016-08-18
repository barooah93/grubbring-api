var app = angular.module('grubbring.services');

/*
Service to:

    1) initialize the map
    2) set map markers for user, nearby rings, nearby grubberies
    
*/
app.service('MapService', ['$http','LoaderService','RingService','GrubberyService','MapCenterService','ListService', function($http,LoaderService,RingService,GrubberyService,MapCenterService,ListService) {
    var map = null;
    
    // initialize map canvas
    var mapCanvas = document.getElementById('map');
    
    var defaultZoomLevel = 15; // TODO: hardcoded for now
    
    var markers = [];

    return {
        InitMap: InitMap, //initializes the map
        PlaceMarkers: PlaceMarkers // place all the markers on the map for rings, grubberies, etc.
    }
    
    function PlaceMarkers() {
        
        // Show spinner
        LoaderService.notifyShowLoader();
        
        // Place markers on map
        placeUserMarkerOnMap();
        placeRingMarkersOnMap();
        placeGrubberyMarkersOnMap();
    }
    
    function clearMarkers() {
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];
    }
    
    function placeRingMarkerOnMap(ring) {
        
        var latLng = {lat : ring.latitude, lng : ring.longitude};
        
        var marker = new google.maps.Marker({
            map: map,
            position: latLng
        });
        
        // Set marker icon color
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
        // add tooltip giving info about the ring
        marker.setTitle(ring.name + "\n" + ring.addr + "\n" + ring.firstName + " " + ring.lastName);
        
        markers.push(marker);
        
        // open ring detail popup on marker click
        /*marker.addListener('click', function() { //TODO: add back in
            openOverlayOnMapMarkerClick(marker)
        });*/

    }
    
    function placeRingMarkersOnMap() {
        RingService.GetNearbyRings().then(function(ringArray) {
            for (var i = 0; i < ringArray.length; i++) {
                placeRingMarkerOnMap(ringArray[i]);
            }
                
            //$scope.isWaitingOnNearbyRings = false;
            
            // Check if the grubbery list was waiting to render
           /* if($scope.grubberiesWaiting){
                populateGrubberiesInList();
            }*/
            
            // Hide spinner
            LoaderService.notifyHideLoader();
        });
    }
    
    function placeGrubberyMarkerOnMap(grubbery) {
        
        var latLng = {lat : grubbery.latitude, lng : grubbery.longitude};
        
        var marker = new google.maps.Marker({
            map: map,
            position: latLng
        });
        // Set marker icon color
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
        // add tooltip giving info about the grubbery
        marker.setTitle(grubbery.name + "\n" + grubbery.addr + "\n" + grubbery.city + " " + grubbery.state);
        
        markers.push(marker);
    }
    
    function placeGrubberyMarkersOnMap() {
         GrubberyService.GetNearbyGrubberies().then(function(grubberyArray) {
            for (var i = 0; i < grubberyArray.length; i++) {
                placeGrubberyMarkerOnMap(grubberyArray[i]);
            }
            
            // Hide spinner
            LoaderService.notifyHideLoader();

            // Set this list to use in populateGrubberiesInList() function
                //$scope.grubberyList = response.data.data;
                
                // Check if get nearby rings is still executing
                /*if($scope.isWaitingOnNearbyRings){
                    $scope.grubberiesWaiting = true;
                } else {
                    populateGrubberiesInList();
                }*/
        });
    }
    
    function placeUserMarkerOnMap() {
        var center = {};
        
        var p = map.getCenter();
        center.lat = p.lat();
        center.long = p.lng();
        
        MapCenterService.SetMapCenter(center);
        var mapCenter = MapCenterService.GetMapCenter();
        var latlng =  {lat: mapCenter.lat, lng: mapCenter.long};
        var marker = new google.maps.Marker({
            map: map,
            position: latlng
        });
    
        // Set marker icon color
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
        marker.setTitle("You are here!");
        
        markers.push(marker);
    }
    
    function initLocationBox() {
        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
        
        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });
        
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();
            
            if (places.length == 0) {
                return;
            }
            
            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function(place) {
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };
                
                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            
            //http://stackoverflow.com/questions/2989858/google-maps-v3-enforcing-min-zoom-level-when-using-fitbounds (possible solution)
            map.fitBounds(bounds); //TODO: set default max and min zoom level - async
            
            // Clear out the old markers before placing new ones:
            clearMarkers();
            RingService.ClearNearbyRings();
            GrubberyService.ClearNearbyGrubberies();
            ListService.ClearListItems();
            
            PlaceMarkers();
            
        });
    }
    
    function InitMap(position) {
        // get client coordinates
        var clientLat = position.coords.latitude;
        var clientLong = position.coords.longitude;
        
        // initialize options for map
        var mapOptions = {
            center: new google.maps.LatLng(clientLat, clientLong),
            zoom: defaultZoomLevel,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        // initialize google map object onto div mapCanvas with specified options
        map = new google.maps.Map(mapCanvas, mapOptions);
        
        // initialize google search box
        initLocationBox();
    }
    
}]);