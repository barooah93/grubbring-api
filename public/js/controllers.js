/**
 * Created by Urvesh on 10/15/15.
 */

var app = angular.module('controllers', []);

app.controller('MainCtrl', function($scope) {

});

app.controller('LoginCtrl', function($scope, $http) {
    $scope.submit = function() {
        $http({
            method: 'POST',
            url: '/api/login',
            data: {
                username: $scope.username,
                password: $scope.password
            }
        }).then(function(response) {
            console.log(response);
        }, function(err) {
            console.log(err);
        })
    }
});

app.controller('ProfileCtrl', function($scope) {

});