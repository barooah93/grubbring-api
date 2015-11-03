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
        $scope.displayMsg1 = false;
        $scope.displayMsg2 = false;
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
            $scope.password = "";
            $http({
                method: 'GET',
                url: '/api/profile/loginAttempts/'+$scope.username,
            }).then(function(response){
                var loginAttemptsRemain = response.data.loginAttempts;
                if(loginAttemptsRemain > 1){
                    $scope.displayMsg1 = true;
                    $scope.loginAttemptMsg = "You have "+loginAttemptsRemain+" login attempts remaining before this account is locked.";
                }
                else if(loginAttemptsRemain == 1){
                    $scope.displayMsg1 = true;
                    $scope.loginAttemptMsg = "You have "+loginAttemptsRemain+" login attempt remaining before this account is locked.";
                }
                else if(loginAttemptsRemain == 0 || loginAttemptsRemain < 0){
                    $scope.displayMsg1 = true;
                    $scope.loginAttemptMsg = "You have attempted to login too many times using incorrect password. This account has been locked. Please reset your password.";
                }
                else{
                    $scope.loginAttemptMsg = "This username does not exist.";
                }
                $scope.displayMsg2 = true;
            }), function(err){

            }
            
        });
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

function DashboardCtrl ($http, $location) {
  this.rings = [{name:'ring1', desc:'hi'},{name:'ring2', desc:'hello'},{name:'ring3', desc:'i am a ring'}, {name:'ring4', desc:'the best'}];
  
  /*
  this.rings = function() {
        $http({
            method: 'GET',
            url: '/api/myrings',
            data: {
                name: this.name,
            }
        }).then(function(response) {
            console.log(response);
            if (response.status == 200){
                alert("Retrieved my rings");
            }
            else{
                alert("Did not retrieve my rings");
                $location.path('/dashboard');
            }
            
        }, function(err) {
            console.log(err);
        })
    }
    */
}

app.controller('DashboardCtrl', DashboardCtrl);

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

app.controller('BeginPasswordResetCtrl', function($scope, $http, $location, passEmailService){
    var email = null;
    $scope.headerMsg = "Find your Grubbring account";
    $scope.dirMsg = "Enter your email address or phone number.";
    $scope.submit = function() {
        email = $scope.email;
        $http({
            method: 'POST',
            url: '/api/profile/resetPassword/generateAccessCode',
            data: {
                email: email
            }
        }).then(function(response) {
            if(response.data.status == "success"){
                $location.path('/confirm_code_reset');
                passEmailService.setEmail(email);
            }else{
                $scope.email = "";
                $scope.headerMsg = "We couldn't find your account with that information";
                $scope.dirMsg = "Please try searching for your email or phone number again.";
                $scope.headerMsg.color = "red";
            }
        }, function(err) {
            alert('Email Address does not exist');
        })
    }
    
});

app.controller('ConfirmCodeResetCtrl', function($scope, $http, $location, passEmailService, passAccessCode){
    $scope.headerMsg = "Validate Access Code";
    $scope.dirMsg = "Please enter in the access code that was sent to you in email/text message.";
    $scope.submit = function() {
        var accessCode = $scope.accessCode;
        var email = passEmailService.getEmail();
        $http({
            method: 'POST',
            url: '/api/profile/resetPassword/validateAccessCode',
            data: {
                accessCode: accessCode,
                email: email
            }
        }).then(function(response) {
            if(response.data.status == "success"){
                console.log(response);
                passAccessCode.setAccessCode(accessCode);
                $location.path('/reset_password');
            }else{
                $scope.headerMsg = "Invalid Access Code";
                $scope.dirMsg = "Please enter in a valid access code to reset your password.";
                $scope.accessCode = "";
            }
        }, function(err) {
            console.log(err);
            alert('Email Address does not exist');
        })
    }
});

app.controller('ResetPasswordCtrl', function($scope, $http, $location, passEmailService, passAccessCode){
   $scope.isDisabled = true;
   $scope.newPassword = "";
   $scope.retypenewPassword = "";
   
   $scope.$watch('retypenewPassword', function(){
       if($scope.newPassword == $scope.retypenewPassword && $scope.newPassword.length > 0 && $scope.retypenewPassword.length > 0){
           $scope.isDisabled = false;
       }
   });
   
   $scope.submit = function() {
        var email = passEmailService.getEmail();
        var accessCode = passAccessCode.getAccessCode();
        $http({
            method: 'POST',
            url: '/api/profile/resetPassword',
            data: {
                accessCode: accessCode,
                email: email,
                newPassword: $scope.newPassword,
                retypenewPassword: $scope.retypenewPassword
            }
        }).then(function(response) {
            if(response.data.status == "success"){
                console.log(response);
                $location.path('/login');
            }else{
                alert("The 2 passwords aren't the same.");
            }
        }, function(err) {
            console.log(err);
            alert('Email Address does not exist');
        })
    }
});

app.service('passEmailService', function() {
      var email = "";
        return {
            getEmail: function () {
                return email;
            },
            setEmail: function(value) {
                email = value;
            }
        };
});

app.service('passAccessCode', function() {
      var accessCode = "";
        return {
            getAccessCode: function () {
                return accessCode;
            },
            setAccessCode: function(value) {
                accessCode = value;
            }
        };
});