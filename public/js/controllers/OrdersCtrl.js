angular.module('grubbring.controllers').controller('OrdersCtrl', function($scope, $http) {
    
    //have $scope.userId now get the rings associated with that user id
    getUserRings();
    
    function getUserRings() { //gets the ringnames that the user is a part of
        $http({
            method: 'GET',
            url: '/api/ring/subscribedRings'
        }).then(function(response) {
            console.log("subscribedrings response " + response.data.data); //JSON.stringify(response)
            $scope.userRings = response.data.data;
        }, function(err) {
            alert("Couldn't get user rings");
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
