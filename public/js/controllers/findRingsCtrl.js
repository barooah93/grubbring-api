angular.module('grubbring.controllers').controller('findRingsCtrl', function findRingsCtrl($scope, $http, $location, StatusCodes) {
    
    $scope.states = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Dakota","North Carolina","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
    
    $scope.rings = null;
    $scope.sortedCounts = null;
    
    // initialize geocoder for finding long and lat of an address
    var geocoder = new google.maps.Geocoder();
    
    getUserDetails();
    
    // array containing rings near person's location
    $scope.listItems = [];
    $scope.searchResults = [];
    
    $scope.isClear = false;    // flag to help with async clearing of list
    $scope.isWaitingOnSearchAPI = false; // flag to help with async updating of the list
    
    // initialize map canvas
    var mapCanvas = document.getElementById('map');
    var defaultZoomLevel = 15; // TODO: hardcoded for now


    // Retrieve user details
    function getUserDetails() {
        // Show spinner
        showHideLoadingSpinner();
        $http({
            method: 'GET',
            url: '/api/profile'
        }).then(function(response) {
            $scope.userId = response.data.userId;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
            }
            else {
                alert('It seems like Geolocation, which is required for this page, is not enabled in your browser.');
            }
        }, function(err) {
            alert("Couldn't get user details: Unauthorized");
            $location.path('/login');
        });
    }
    

    // if successfully received long and lat, find rings and display markers on map
    function successFunction(position) {
         
        // get client coordinates
        $scope.lat = position.coords.latitude;
        $scope.long = position.coords.longitude;
        

        // initialize options for map
        var mapOptions = {
            center: new google.maps.LatLng($scope.lat, $scope.long),
            zoom: defaultZoomLevel,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        // initialize google map object onto div mapCanvas with specified options
        var map = new google.maps.Map(mapCanvas, mapOptions);
        
        // Place user marker on map
        placeUserMarkerOnMap($scope.lat, $scope.long);
        
        // Get nearby rings and display markers
        getNearbyRings($scope.lat, $scope.long);
        
        // open popup overlay for selected marker
        openOverlayOnMapMarkerClick($scope.lat, $scope.long);

        // Function to populate list with nearby rings and display markers on map
        function getNearbyRings(lat, long){
            // get suggested rings to display to user
            $http({
                method: 'GET',
                url: '/api/ring?latitude='+lat +'&longitude=' + long
            }).then(function(response) {
                
                // Clear list of items
                $scope.listItems = [];
                $scope.nearbyRingsList = [];
            
                if(response.data.data != null) {
                    for (var i = 0; i < response.data.data.length; i++) {
                        placeRingMarkerOnMap(response.data.data[i]);
                        response.data.data[i].isRing = true;
                        $scope.nearbyRingsList.push(response.data.data[i]);
                        
                    }
                    $scope.listItems = $scope.nearbyRingsList;
                    
                    // Now load grubberies to map and list
                    getNearbyGrubberies(lat, long);
                   
                    // Show spinner
                    showHideLoadingSpinner();
                    
                } else {
                    // TODO: display message to user to prompt them to be first to create a ring in their area
                    $scope.showLoader=false;
                }
    
            }, function(err) {
                console.log(err);
            });
        }
        
        function getNearbyGrubberies(lat, long){
            // get nearby grubberies to display to user
            $http({
                method: 'GET',
                url: '/api/grubbery?latitude='+lat +'&longitude=' + long
            }).then(function(response) {
                if(response.data.data != null) {
                    for (var i = 0; i < response.data.data.length; i++) {
                        placeGrubberyMarkerOnMap(response.data.data[i]);
                        response.data.data[i].isGrubbery = true;
                        
                        // Add to list that's displayed to user
                        $scope.listItems.push(response.data.data[i]);
                    }
                    
                    // Show spinner
                    showHideLoadingSpinner();
                } else {
                    // TODO: display message to user to prompt them to be first to create a ring in their area
                    $scope.showLoader=false;
                }
    
            }, function(err) {
                console.log(err);
            });
        }
        
// ---------------------- Google Map Markers ---------------------------------------------------------------------------
        
        
        // decodes address into long and lat coordinates to add marker for user to the map
        function placeUserMarkerOnMap(lat, long) {
            var latlng =  {lat: lat, lng: long};
            var marker = new google.maps.Marker({
                map: map,
                position: latlng
            });
            // Set marker icon color
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
            marker.setTitle("You are here!");
            // add tooltip giving info about the ring
            // geocoder.geocode({'location': latlng}, function(results, status) {
            //     if (status === google.maps.GeocoderStatus.OK) {
            //         if (results[1]) {
            //             marker.setTitle(results[1]);
            //         }
            //         console.log(results[1]);
            //         console.log(results[0]);
            //     }
            // });

        }
        
         // opens detail popup overlay when clicking on map marker
        function openOverlayOnMapMarkerClick(marker){
             var marker = marker;
             var contentString = '<div id="content">'+
              '<div id="siteNotice">'+
              '</div>'+
              '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
              '<div id="bodyContent">'+
              '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
              'sandstone rock formation in the southern part of the '+
              'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
              'south west of the nearest large town, Alice Springs; 450&#160;km '+
              '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
              'features of the Uluru - Kata Tjuta National Park. Uluru is '+
              'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
              'Aboriginal people of the area. It has many springs, waterholes, '+
              'rock caves and ancient paintings. Uluru is listed as a World '+
              'Heritage Site.</p>'+
              '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
              'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
              '(last visited June 22, 2009).</p>'+
              '</div>'+
              '</div>';
        
              var infowindow = new google.maps.InfoWindow({
                content: contentString
              });
        

              marker.addListener('click', function() {
                infowindow.open(map, marker);
              });
            
        }
        
        // decodes address into long and lat coordinates to add ring markers to the map
        function placeRingMarkerOnMap(ring) {
            geocoder.geocode({'address': ring.addr + ' ' + ring.city + ', ' + ring.state}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    // Set marker icon color
                    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                    // add tooltip giving info about the ring
                    marker.setTitle(ring.name + "\n" + ring.addr + "\n" + ring.firstName + " " + ring.lastName);
                    // open ring detail popup on marker click
                    openOverlayOnMapMarkerClick(marker)
                    
                    
                } else {
                    alert("We could not find nearby rings successfully, geocoder could not find location: " + status);
                }
            });

        }
        
       
        
        // decodes address into long and lat coordinates to add ring markers to the map
        function placeGrubberyMarkerOnMap(grubbery) {
            geocoder.geocode({'address': grubbery.addr + ' ' + grubbery.city + ', ' + grubbery.state}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    // Set marker icon color
                    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                    // add tooltip giving info about the ring
                    marker.setTitle(grubbery.name + "\n" + grubbery.addr + "\n" + grubbery.city + " " + grubbery.state);
                } else {
                    alert("We could not find nearby grubberies successfully, geocoder could not find location: " + status);
                }
            });

        }
    }

    
// ---------------------- Google Map Markers End ---------------------------------------------------------------------------
    
// ----------------------- Search Algorithm ----------------------------------------------------------------------------
    // Event listener for search input change
    $scope.onSearchTextChanged = function(){
        
        var amountOfKeysToCallAPI = 2;
        
        // Error check search text
        if($scope.searchText != null && $scope.searchText != "" && $scope.searchText.length >= amountOfKeysToCallAPI){
            
            // Only make api call if text is a certain amount of letters
            if($scope.searchText.length == amountOfKeysToCallAPI){
                
                $scope.searchResults = [];
                    
                $scope.isClear = false;
                
                // Make http request to get search results
                $http({
                    method: 'GET',
                    url: '/api/search/'+$scope.searchText+'?context=findRings&latitude='+$scope.lat +'&longitude=' + $scope.long
                }).then(function(response) {
                    
                    if(response.data.data != null) {
                        if(!$scope.isClear){
                            
                            // Clear list of items
                            $scope.listItems = [];
                            $scope.searchResults = [];
                            
                            // Loop through grubberies array, set isGrubbery property, and add to the list to be displayed
                            for(var j=0; j< response.data.data.grubberies.length; j++){
                                response.data.data.grubberies[j].isGrubbery = true;
                                $scope.listItems.push(response.data.data.grubberies[j]);
                                $scope.searchResults.push(response.data.data.grubberies[j]);
                            }
                            
                            // Loop through rings array, set isRing property, and add to the list to be displayed
                            for(var k=0; k< response.data.data.rings.length; k++){
                                response.data.data.rings[k].isRing = true;
                                $scope.listItems.push(response.data.data.rings[k]);
                                $scope.searchResults.push(response.data.data.rings[k]);
                            }
                            
                             // Response finished, if more letters were typed while waiting, execute search
                            if($scope.isWaitingOnSearchAPI){
                                searchThroughCache();
                                 $scope.isWaitingOnSearchAPI = false;
                            }
                        }
                    } else {
                        console.log("response.data.data is null - no rings or grubberies found in search results");
                        
                    }
    
                }, function(err) {
                    console.log(err);
                });
            }
            else if($scope.searchText.length > amountOfKeysToCallAPI) { 
                // Check if cache has data, if so search through it, else set async bool to true
                if($scope.searchResults.length > 0){
                    searchThroughCache();
                }else{
                    $scope.isWaitingOnSearchAPI = true;
                }
            }
        }
        else {
            // Reset list
            $scope.isClear = true;
            $scope.listItems = $scope.nearbyRingsList;
            
        }
    }
    
    // Filters list with found search keys from cache
    function searchThroughCache(){
        // Clear what's in current list
        $scope.listItems = [];
        
        // Replace multiple spaces with a single space and any tabs, endline symbols, etc.
        var cleanedSearchText = $scope.searchText.replace(/\s\s+/g, ' ');
        var searchWords = cleanedSearchText.split(" ");
        
        // Loop through cached search results
        for(var i=0; i<$scope.searchResults.length; i++){
            var foundAllWords = true;
            // Loop through each search word and set boolean to false if one of the words or letters doesnt match
            for(var j=0; j<searchWords.length; j++){
                if($scope.searchResults[i].name.toLowerCase().indexOf(searchWords[j].toLowerCase()) < 0){
                    foundAllWords = false;
                }
            }
            
            // Push to list if all words and letters were found
            if(foundAllWords){
                 $scope.listItems.push($scope.searchResults[i]);
            }
        }
    
    }
    
// ----------------------- Search Algorithm End ----------------------------------------------------------------------------

// ----------------------- Location Search Start --------------------------------------------------------------------------
    $scope.onLocationTextChanged = function(){
        console.log($scope.searchLocationText);
        
        $scope.locations = [];
        
    }
// ----------------------- Location Search End -----------------------------------------------------------------------------

    // TODO: render something useful to user
    function errorFunction(position) {
        console.log('Error!');
    }
    




    function getRingsUserIsPartOf() { /*broken*/
        $http({
            method: 'GET',
            url: '/api/ring/subscribedRings/' + $scope.userId
        }).then(function(response) {

            if (response.data.data == null) { //no rings call shivangs
                //bring up the find rings api
                $http({
                    method: 'GET',
                    url: '/api/ring'
                }).then(function(response) {
                    $scope.ringId = response.data.ringId //rings you can join
                }, function(err) {
                    console.log(err);
                    $location.path('/dashboard');
                });
            } else {
                $scope.rings = response.data.data.ringsWithActivities;

                $scope.ringsWithOrders = response.data.data.ringsWithOrders;

                /*For each ring with activities, find if there is a tie, if there is a tie put the ring that has more orders at an index
                 before the ring with less orders in the $scope.rings array*/
                var unsortedList = $scope.rings;
                var len = unsortedList.length;
                //assign numOrders to each ring with activities, sort numOrders within numActivities using insertion sort
                for (var i = 0; i < len; i++) {
                    var tempRing = unsortedList[i];
                    tempRing.numOrders = getNumOrders($scope.ringsWithOrders, tempRing.name);
                    /*Check through the sorted part and compare with the
                     number in tmp. If large, shift the number*/
                    for (var j = i - 1; j >= 0 && (unsortedList[j].numOrders < tempRing.numOrders) && unsortedList[j].numActivities == tempRing.numActivities; j--) {
                        unsortedList[j + 1] = unsortedList[j];
                    }
                    unsortedList[j + 1] = tempRing;
                }

                for (i = 0; i < response.data.data.ringsWithNoActivities.length; i++) {
                    response.data.data.ringsWithNoActivities[i].numActivities = 0;
                    response.data.data.ringsWithNoActivities[i].numOrders = 0;
                    $scope.rings.push(response.data.data.ringsWithNoActivities[i]);
                }
            }
        }, function(err) {
            console.log(err);
            $location.path('/dashboard');
        });
    }
    
    function getNumOrders(ringsWithOrders, ringName) {
        for(var i = 0; i < ringsWithOrders.length; i++){
            if(ringsWithOrders[i].name == ringName) {
                return ringsWithOrders[i].numOrders;
            }
        }
    }
    
    function showHideLoadingSpinner(){
        if($scope.listItems == null || $scope.listItems.length == 0){
            $scope.showLoader=true;
        }
        else{
            $scope.showLoader=false;
        }
        
    }
    
    $scope.displayRingPanelOverlay = function(item){
        if (item != null){
            $scope.name = item.name;
            $scope.address = item.addr+", "+item.city+", "+item.state+", "+item.zipcode;
            $scope.showRingDetailOverlay=true; 
            
            // to grab the ring leader username
            $http({
                    method: 'GET',
                    url: '/api/ring/getLeaderDetails/'+item.createdBy+'/'+item.ringId
                }).then(function(response) {
                     console.log(response.data.data);
                    $scope.leader = response.data.data[0].username;
                }, function(err) {
                    console.log(err);
            });
            
            // to grab the number of grubblings for ring
            $http({
                    method: 'GET',
                    url: '/api/ring/getRingGrubblingsCount/'+item.ringId
                }).then(function(response) {
                    if (response.data.data[0].grubblingCount == 0){
                        $scope.grubblings = "No Grubblings have joined this ring."
                    }
                    else{
                        if (response.data.data[0].grubblingCount == 1){
                          $scope.grubblings = response.data.data[0].grubblingCount+" Grubbling";
                        }
                        else{
                          $scope.grubblings = response.data.data[0].grubblingCount+" Grubblings";
                        }
                    }
                }, function(err) {
                    console.log(err);
            });
            // to grab the latest activity date and time for selected ring
             $http({
                    method: 'GET',
                    url: '/api/activities/getLastActivity/'+item.ringId
                }).then(function(response) {
                  if (response.data.data.length > 0){
                     $scope.lastActivity = response.data.data[0].enteredDate;  
                  }
                  else{
                      $scope.lastActivity = "No activities have been created yet."
                  }
                }, function(err) {
                    console.log(err);
            });
         }
       else{
           $scope.showRingDetailOverlay=false;
       }
    }
    
    $scope.closeRingDetailOverlay = function(){
        $scope.showRingDetailOverlay = false;
    }


});
