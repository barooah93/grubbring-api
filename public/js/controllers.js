/**
 * Created by Urvesh on 10/15/15.
 */

/* global angular */
var app = angular.module('controllers', []);

app.controller('MainCtrl', function($scope) {

});

app.controller('LoginCtrl', function($scope, $http, $location) {
            
            $(function(){

    //             $(document).ready(function() {
	   //            $('#fullpage').fullpage({
				//         sectionsColor: ['#1ebd98', '#1BBC9B', '#7E8F7C', '#D42632'],
				//         navigation: true,
				//         navigationPosition: 'right',
				//         navigationTooltips: ['First page', 'Second page', 'Third and last page'],
				//         loopTop: true,
				//         loopBottom: true

			 //   });

    //              });


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

app.controller('ProfileCtrl', function($scope, $http, $location) {
    $http({
        method: 'GET',
        url: '/api/profile'
    }).then(function (response) {
        console.log(response);
        $scope.user = response.data;
    }, function (err) {
        console.log(err);
        $location.path('/login');
    });

    $scope.updateEmail = function() {
        $http({
            method: 'POST',
            url: '/api/profile/updateEmail',
            data: {
                newEmail: $scope.newEmail
            }
        }).then(function(response) {
            console.log(response);
            $scope.newEmail = '';
            //need to refresh page so you can see new email update
        }, function(err) {
            console.log(err);
        })
    }

    $scope.updateCellNumber = function() {
        $http({
            method: 'POST',
            url: '/api/profile/updateCellNumber',
            data: {
                newCell: $scope.newCell
            }
        }).then(function (response) {
            console.log(response);
            $scope.newCell = '';
            //refresh page or send the new user data back.
        }, function(err) {
            console.log(err);
        })
    }

    $scope.updatePassword = function() {
        $http({
            method: 'POST',
            url: '/api/profile/updatePassword',
            data: {
                oldPassword: $scope.oldPassword,
                newPassword: $scope.newPassword,
                confirmPassword : $scope.confirmPassword
            }
        }).then(function(response) {
            console.log(response);
            $scope.oldPassword = '';
            $scope.newPassword = '';
            $scope.confirmPassword = '';
            //no refreshing of page needed since user cant see password
        }, function(err) {
            console.log(err);
        })
    }


});

app.controller('RegistrationCtrl', function($scope, $http){
    $scope.register = function() {
        $http({
            method: 'POST',
            url: '/api/registration',
            data: {
                
                username: $scope.username,
                password: $scope.password,
                firstname: $scope.firstname,
                lastname: $scope.lastname,
                email: $scope.email,
                phonenumber: $scope.phonenumber
            }
        }).then(function(response) {
            console.log(response);
            if (response.description == "This username/email has already been used for an account."){ //change to custom status code later?
                //post modal message here
            }
            else{
                
            }
        }, function(err) {
            console.log(err);
        })
    }
});

app.controller('DashboardCtrl', function($scope){
    
});