angular.module('grubbring.controllers').controller('ActivityCtrl', function ActivityCtrl($scope, $http, $location) {
    $scope.userId = "";

    getUserDetails();

    function getUserDetails() {
        $http({
            method: 'GET',
            url: '/api/profile'
        }).then(function(response) {
            console.log(response);
            $scope.userId = response.data.userId
        }, function(err) {
            console.log(err);
            $location.path('/activities');
        });
    }

    $scope.createActivity = function() {
        $http({
            method: 'POST',
            url: '/api/activities/createActivity',
            data: {
                userId: $scope.userId,
                ringId: $scope.ringId,
                bringerUserId: $scope.bringerUserId,
                maxNumOrders: $scope.maxNumOrders,
                grubberyId: $scope.grubberyId,
                lastOrderDateTime: $scope.lastOrderDateTime
            }
        }).then(function(response) {
            console.log(response);
            $location.path('/activities');
        }, function(err) {
            console.log(err);
            $location.path('/activities');
        });
    };

    $scope.updateActivity = function() {
        $http({
            method: 'POST',
            url: '/api/activities/updateActivity',
            data: {
                maxNumOrders: $scope.maxNumOrders,
                lastOrderDateTime: $scope.lastOrderDateTime,
                bringerUserId: $scope.bringerUserId,
                grubberyId: $scope.grubberyId,
                activityId: $scope.activityId
            }
        }).then(function(response) {
            console.log(response);
            $location.path('/activities');
        }, function(err) {
            console.log(err);
            $location.path('/activities');
        });
    }

});
