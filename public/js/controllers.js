/**
 * Created by Urvesh on 10/15/15.
 */

/* global angular */
var app = angular.module('controllers', []);

app.controller('MainCtrl', function($scope) {

});

app.controller('LoginCtrl', function($scope, $http, $location) {
            $(function(){
                
                $('img').delay(1000);
                $('img').animate({'margin-top': '-125px'}, 800);
                
                 $('#login-form').hide().delay(1500);
                 $('#login-form').fadeIn(1200);
                
            });
            
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
            $location.path('/dashboard');
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