angular.module('grubbring.controllers').controller('OrdersCtrl', function($scope, $http) {
    $scope.userRings = [];
    $scope.numActivities = [];
    $scope.ringNameNumActivity = [];

    //have $scope.userId now get the rings associated with that user id
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
            console.log(response.data.data[0]); //JSON.stringify(response)
            //$scope.numActivities.push(response.data.data);
            $scope.ringNameNumActivity.push({name: name, ringId: ringId, numActivities: response.data.data[0].numActivities});
            //this is interesting[{"name":"the search example","ringId":4,"$$hashKey":"object:5"},{"name":"Test Ring for Members","ringId":1}]

            console.log("this is interesting" + JSON.stringify($scope.ringNameNumActivity));
            
        }, function(err) {
            alert("Couldn't get useractivity num for the ring");
            $location.path('/orders');
        });
    }
    

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
});
