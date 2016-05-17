angular.module('grubbring.controllers').controller('findRingsCtrl', function findRingsCtrl($scope, $http, $location) {

    $scope.rings = null;
    $scope.sortedCounts = null;
    getUserDetails();
    

    // array containing rings near person's location
    $scope.listItems = [];

    // initialize map canvas
    var mapCanvas = document.getElementById('map');
    var zoomLevel = 15; // TODO: hardcoded for now

    
    // Retrieve user details
    function getUserDetails() {
        $http({
            method: 'GET',
            url: '/api/profile'
        }).then(function(response) {
            console.log(response.data.userId);
            $scope.userId = response.data.userId;
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
                }
                else {
                    alert('It seems like Geolocation, which is required for this page, is not enabled in your browser.');
                }
        }, function(err) {
            console.log("Couldn't get user details:");
            console.log(err);
        });
    }
    

    // if successfully received long and lat, find rings and display markers on map
    function successFunction(position) {
         
        // get client coordinates
        $scope.lat = position.coords.latitude;
        $scope.long = position.coords.longitude;

        // initialize geocoder for finding long and lat of an address
        var geocoder = new google.maps.Geocoder();

        // initialize options for map
        var mapOptions = {
            center: new google.maps.LatLng($scope.lat, $scope.long),
            zoom: zoomLevel,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        // initialize google map object onto div mapCanvas with specified options
        var map = new google.maps.Map(mapCanvas, mapOptions);

        // get suggested rings to display to user
        $http({
            method: 'GET',
            url: '/api/ring?latitude='+$scope.lat +'&longitude=' + $scope.long
        }).then(function(response) {
            
            // Clear list of items
            $scope.listItems = [];
            $scope.nearbyRingsList = [];
        
            console.log("users lat long " + $scope.lat + " " + $scope.long);
            console.log(response.data.data);
            if(response.data.data != null) {
                for (var i = 0; i < response.data.data.length; i++) {
                    codeAddress(response.data.data[i]);
                    response.data.data[i].isRing = true;
                    $scope.nearbyRingsList.push(response.data.data[i]);
                    $scope.listItems = $scope.nearbyRingsList;
                }
            } else {
                console.log("response.data.data is null - no rings in the area for user " + $scope.userId);
                // TODO: display message to user to prompt them to be first to create a ring in their area
            }

        }, function(err) {
            console.log(err);
        });
        
        // decodes address into long and lat coordinates to add markers to the map
        function codeAddress(ring) {
            geocoder.geocode({'address': ring.addr + ' ' + ring.city + ', ' + ring.state}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    // add tooltip giving info about the ring
                    marker.setTitle(ring.name + "\n" + ring.addr + "\n" + ring.firstName + " " + ring.lastName);
                } else {
                    alert("We could not find nearby locations successfully: " + status);
                }
            });

        }
    }
    
    // Event listener for search input change
    $scope.onSearchTextChanged = function(){
        
        // Error check search text
        if($scope.searchText != null && $scope.searchText != ""){
        
            // Make http request to get search results
            $http({
                method: 'GET',
                url: '/api/search/'+$scope.searchText+'?context=findRings&latitude='+$scope.lat +'&longitude=' + $scope.long
            }).then(function(response) {
                
                 // Clear list of items
                $scope.listItems = [];
                
                console.log(response.data.data);
                if(response.data.data != null) {
                    // Loop through grubberies array, set isGrubbery property, and add to the list to be displayed
                    for(var j=0; j< response.data.data.grubberies.length; j++){
                        response.data.data.grubberies[j].isGrubbery = true;
                        $scope.listItems.push(response.data.data.grubberies[j]);
                    }
                    
                    // Loop through rings array, set isRing property, and add to the list to be displayed
                    for(var k=0; k< response.data.data.rings.length; k++){
                        response.data.data.rings[k].isRing = true;
                        $scope.listItems.push(response.data.data.rings[k]);
                    }
                    console.log($scope.listItems);
                } else {
                    console.log("response.data.data is null - no rings or grubberies found in search results");
                    
                }
    
            }, function(err) {
                console.log(err);
            });
        }
        else {
            console.log("No text, repopulate list");
            // Reset list
            $scope.listItems = $scope.nearbyRingsList;
        }
    }

    // TODO: render something useful to user
    function errorFunction(position) {
        console.log('Error!');
    }
    




    function getRingsUserIsPartOf() { /*broken*/
        $http({
            method: 'GET',
            url: '/api/ring/subscribedRings/' + $scope.userId
        }).then(function(response) {
            console.log($scope.userId);

            if (response.data.data == null) { //no rings call shivangs
                //bring up the find rings api
                $http({
                    method: 'GET',
                    url: '/api/ring'
                }).then(function(response) {
                    console.log(response);
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


});
