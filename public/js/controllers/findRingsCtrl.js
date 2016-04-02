module.exports = function($scope, $http, $location) {

    // array containing rings near person's location
    $scope.nearbyRings = [];

    // initialize map canvas
    var mapCanvas = document.getElementById('map');
    var zoomLevel = 15;

    // Use this if customizing popup when hovering over marker --------------------------------
    // // div box for marker
    // var popup = $('#popup');

    // // intialize popup for markers
    // popup.hide();
    // popup.css('background-color', 'white');
    // popup.css('position','absolute');
    // popup.css('z-index',2);
    // --------------------------------------------------------------

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
    }
    else {
        alert('It seems like Geolocation, which is required for this page, is not enabled in your browser.');
    }

    // if successfully received long and lat 
    function successFunction(position) {
        // get client coordinates
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        // initialize geocoder for finding long and lat of an address
        var geocoder = new google.maps.Geocoder();

        // initialize options for map
        var mapOptions = {
            center: new google.maps.LatLng(lat, long),
            zoom: zoomLevel,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        // initialize google map object onto div mapCanvas with specified options
        var map = new google.maps.Map(mapCanvas, mapOptions);

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

        // get suggested rings to display to user
        $http({
            method: 'GET',
            url: '/api/ring?latitude=' + lat + '&longitude=' + long
        }).then(function(response) {
            console.log(response);
            for (var i = 0; i < response.data.data.length; i++) {
                codeAddress(response.data.data[i]);
                $scope.nearbyRings.push(response.data.data[i]);
            }

        }, function(err) {
            console.log(err);
        });
    }

    function errorFunction(position) {
        console.log('Error!');
    }

};
