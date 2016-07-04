angular.module('grubbring.controllers').controller('OrdersCtrl', ['$scope', '$http', function($scope, $http) {
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
