angular.module('grubbring.controllers').controller('OrdersCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.userRings = [];
    $scope.numActivities = [];
    $scope.ringNameNumActivity = [];

    //have $scope.userId now get the rings associated with that user id
    getUserRings();
    getActivities(2);
    
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
    
    function getActivities(ringId) { //TODO: test
        $http({
            method: 'GET',
            url: '/api/activities/getActivities/' + ringId
        }).then(function(response) {
            console.log("the activity: " + JSON.stringify(response.data.data));
            $scope.activities = response.data.data;
        }, function(err) {
            $location.path('/orders');
        });
    }
    
    function getNumOpenOrders(activityId) { //TODO: test
        $http({
            method: 'GET',
            url: '/api/orders/numOpenOrders/' + activityId
        }).then(function(response) {
            $scope.numOpenOrders.push({activityId: activityId, numOpenOrders: response.data.data[0]});
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
    
    $scope.createOrder = function() {
        if ($scope.order.paymentStatus != 0 && $scope.order.paymentStatus != 1) {
            console.log('Payment Status can only be 1 (true) or 0 (false)');
            return;
        }
        $http({
            method: 'POST',
            url: '/api/orders/createOrder',
            data: $scope.order
        }).then(function(response) {
            console.log(response.data.description);
        }, function(error) {
            console.log(error);
        })
    }
}]);
