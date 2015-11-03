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
            alert('Login failed!');
        })
    }
});

app.controller('ProfileCtrl', function($scope, $http, $location) {
    onLoad();

    function onLoad() {
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
    }
    
    $scope.updateEmail = function() {
        $http({
            method: 'PUT',
            url: '/api/profile/email',
            data: {
                newEmail: $scope.newEmail
            }
        }).then(function(response) {
            console.log(response);
            $scope.newEmail = '';
            onLoad();
            //need to refresh page so you can see new email update
        }, function(err) {
            console.log(err);
        })
    }

    $scope.updateCellNumber = function() {
        $http({
            method: 'PUT',
            url: '/api/profile/cellphone',
            data: {
                newCell: $scope.newCell
            }
        }).then(function (response) {
            console.log(response);
            $scope.newCell = '';
            onLoad();
            //refresh page or send the new user data back.
        }, function(err) {
            console.log(err);
        })
    }

    $scope.updatePassword = function() {
        $http({
            method: 'POST',
            url: '/api/profile/password',
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
            onLoad();
            //no refreshing of page needed since user cant see password
        }, function(err) {
            console.log(err);
        })
    }


});

app.controller('RegistrationCtrl', function($scope, $http, $location){
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
            if (response.status == 200){
                alert("There is a user already registered with that username/e-mail address!");
            }
            else{
                $location.path('/confirmation');
            }
            
        }, function(err) {
            console.log(err);
        })
    }
});


/***************steph********************/

/*Retrieves the ring details that the signed in user is a leader of */
app.controller('DashboardCtrl', function DashboardCtrl ($scope, $http, $location) {
    getUserDetails();
  
    function getUserDetails() {
        $http({
            method: 'GET',
            url: '/api/profile'
        }).then(function (response) {
            console.log(response);
            $scope.userId = response.data.userId
            getRingsUserIsPartOf();
        }, function (err) {
            console.log(err);
            $location.path('/dashboard');
        });
    }
    
    function getRingsUserIsPartOf() {
          $http({
            method: 'GET',
            url: '/api/ring/subscribedRings/' + $scope.userId
        }).then(function (response) {
            console.log(response);
            $scope.rings = response.data.data;
        }, function (err) {
            console.log(err);
            $location.path('/dashboard');
        });
    }
    
});

/***********************************/

app.controller('ConfirmationCtrl', function($scope, $http){
    $http({
        method: 'GET',
        url: '/api/registration/confirmation'
    }).then(function (response) {
        console.log(response);
    }, function (err) {
        console.log(err);
});
  
$scope.submit = function() {
  
  $http({
            method: 'POST',
            url: '/api/registration/confirmation',
            data: {
                confirmation: $scope.confirmation
            }
        }).then(function(response) {
            console.log(response);
            var str = response.description;
            if (str == "Account has been confirmed." ){ //they're the same - replace with status code later. also reg.js needs to be fixed.
                alert("you're confirmed! congrats");
            } 
            else{
                alert("Account could not be confirmed");
            }
            
        }, function(err) {
            console.log(err);
        })
     
 } 
    
});

app.controller('TemplateCtrl', function($scope){
    
    document.querySelector( "#nav-toggle" ).addEventListener( "click", function() {
    this.classList.toggle( "active" );
    });
    
    document.addEventListener("touchstart", function(){}, true);
    
});