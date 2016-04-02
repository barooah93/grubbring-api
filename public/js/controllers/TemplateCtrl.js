angular.module('grubbring.controllers').controller('TemplateCtrl', function($scope, $http, $location) {

    // different search functionality for different pages
    $scope.searchBox = function() {
        //if location is /find_rings
        if ($location.path() == '/find_rings') {
            if ($scope.search.length >= 3) {
                $http({
                    method: 'GET',
                    url: '/api/ring/search/' + $scope.search
                }).then(function(response) {
                    if (response.data.data.rings.length != 0 || response.data.data.leaders.length != 0) {
                        console.log(response);
                    }
                    else {
                        console.log(response.data.description);
                    }
                }, function(err) {
                    console.log(err);
                });
            }
        }

    };

    // document.querySelector( "#nav-toggle" ).addEventListener( "click", function() {
    // this.classList.toggle( "active" );
    // });

    // document.addEventListener("touchstart", function(){}, true);


});
