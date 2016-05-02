/*Retrieves the ring details that the signed in user is a leader of */
angular.module('grubbring.controllers').controller('DashboardCtrl', function DashboardCtrl($scope, $http, $location, $document) {
    $scope.rings = null;
    $scope.sortedCounts = null;
    getUserDetails(function(userDetailsObject){
        console.log("test userid: "+userDetailsObject.userId);
        // getRingsUserIsPartOf(userDetailsObject.userId);
        if ($scope.rings == null){
            //the user is not part of any rings yet
            $scope.showOverlay = true;
        }
        else{
            $scope.showOverlay = false;
        }
    });
    

    // Retrieve user details
    function getUserDetails(callback) {
        $http({
            method: 'GET',
            url: '/api/profile'
        }).then(function(response) {
            console.log(response.data.userId);
            callback(response.data);
        }, function(err) {
            console.log(err);
            callback(null);
            // $location.path('/dashboard');
        });
        
    }
    
   

    function getRingsUserIsPartOf(userId) { /*broken*/
        $http({
            method: 'GET',
            url: '/api/ring/subscribedRings/'
        }).then(function(response) {
            console.log(response.data);

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
                //var unsortedList = $scope.rings;
               // var len = unsortedList.length;
                //assign numOrders to each ring with activities, sort numOrders within numActivities using insertion sort
                // for (var i = 0; i < len; i++) {
                //     var tempRing = unsortedList[i];
                //     tempRing.numOrders = getNumOrders($scope.ringsWithOrders, tempRing.name);
                //     /*Check through the sorted part and compare with the
                //      number in tmp. If large, shift the number*/
                //     for (var j = i - 1; j >= 0 && (unsortedList[j].numOrders < tempRing.numOrders) && unsortedList[j].numActivities == tempRing.numActivities; j--) {
                //         unsortedList[j + 1] = unsortedList[j];
                //     }
                //     unsortedList[j + 1] = tempRing;
                // }

                // for (i = 0; i < response.data.data.ringsWithNoActivities.length; i++) {
                //     response.data.data.ringsWithNoActivities[i].numActivities = 0;
                //     response.data.data.ringsWithNoActivities[i].numOrders = 0;
                //     $scope.rings.push(response.data.data.ringsWithNoActivities[i]);
                // }
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

    $scope.redirectToFindRings = function(){
        $location.path('/find_rings');
    }
});
