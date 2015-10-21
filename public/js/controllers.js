/**
 * Created by Urvesh on 10/15/15.
 */


var app = angular.module('controllers', []);

app.controller('MainCtrl', function($scope) {

});

app.controller('LoginCtrl', function($scope, $http, $window) {
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
            $window.alert('hello!'); //not working right now
        }, function(err) {
            console.log(err);
        })
    }
});

app.controller('ProfileCtrl', function($scope) {

});

app.controller('RegistrationCtrl', function($scope, $http){
    $scope.submit = function() {
        $http({
            method: 'POST',
            url: '/api/registration',
            data: {
                firstname: $scope.firstname,
                lastname: $scope.lastname,
                username: $scope.username,
                password: $scope.password,
                email: $scope.email,
                phonenumber: $scope.phonenumber
            }
        }).then(function(response) {
            console.log(response);
        }, function(err) {
            console.log(err);
        })
    }
});

app.controller('DashboardCtrl', function($scope){
    
});