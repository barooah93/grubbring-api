/*Retrieves the ring details that the signed in user is a leader of */
angular.module('grubbring.controllers').controller('DashboardCtrl', function DashboardCtrl($scope, $http, $location, $document) {
    $scope.rings = null;
    $scope.sortedCounts = null;
    
    $scope.userRings = [];
    $scope.numActivities = [];
    $scope.ringNameNumActivity = [];
    $scope.activityList = [];
    
    getUserRings();
    
    function getUserRings() { //gets the ringnames that the user is a part of
        $http({
            method: 'GET',
            url: '/api/ring/subscribedRings'
        }).then(function(response) {
            $scope.userRings = response.data.data;
            
            for(var i = 0; i < $scope.userRings.length; i++) {
                getNumActivities($scope.userRings[i].ringId, $scope.userRings[i].name);
            }
            
        }, function(err) {
            alert("Couldn't get user rings");
            $location.path('/orders');
        });
    }
    
    function getNumActivities(ringId, name) { //gets the ringnames that the user is a part of
        $http({
            method: 'GET',
            url: '/api/activities/getNumActivities/' + ringId
        }).then(function(response) {
            $scope.ringNameNumActivity.push({name: name, ringId: ringId, numActivities: response.data.data[0].numActivities});
        }, function(err) {
            alert("Couldn't get useractivity num for the ring");
            $location.path('/orders');
        });
    }
    
    /*Need:
    Firstname of bringerUserId, 
    name of grubbery, 
    number of open orders, 
    time left to join 
    from table activity where activity is in a certain ring
    */
    
    getActivities(2);
    
    function getActivities(ringId) { //TODO: test
        $http({
            method: 'GET',
            url: '/api/activities/getActivities/' + ringId
        }).then(function(response) {
           // console.log("the activities: " + JSON.stringify(response.data.data));
            $scope.activities = response.data.data;
            
            for(var i = 0; i < $scope.activities.length; i++) {
                getNumOpenOrders($scope.activities[i], $scope.activities[i].activityId);
            }
            
        }, function(err) {
            $location.path('/orders');
        });
    }
    
    function getNumOpenOrders(activity, activityId) { //TODO: test
        $http({
            method: 'GET',
            url: '/api/orders/numOpenOrders/' + activityId
        }).then(function(response) {
            $scope.activityList.push({activityObj: activity, numOpenOrders: response.data.data[0]});
            console.log("this list  " + JSON.stringify($scope.activityList));
        }, function(err) {
            $location.path('/orders');
        });
    }
    
    
    /* TODO: get
    username of who posted the activity for a particular ringid
    grubbery name
    number of open orders
    how much time left to join
    */
/*    $scope.numOpenOrders = function() {
        OrderService.getNumOpenOrders(1);
    };*/
    
    
    
    
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
