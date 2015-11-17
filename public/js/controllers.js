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
                username: $scope.email,
                password: $scope.password
            }
        }).then(function(response) {
            console.log(response);
            $location.path('/dashboard');
        }, function(err) {
            $scope.password = "";
            $http({
                method: 'GET',
                url: '/api/profile/loginAttempts/'+$scope.email,
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
                    $location.path('/begin_password_reset');

                }
                else{
                    $scope.loginAttemptMsg = "This username or password is invalid.";
                }
                $scope.displayMsg2 = true;
            }), function(err){

            }

        });
    }
});

app.controller('ProfileCtrl', function($scope, $http, $location, Password, passEmailService) {
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

        var newEmail = $scope.newEmail;

        if ($scope.user.emailAddr === newEmail) {
            console.log('New email address cannot match your current email address.');
            return;
        }

        $http({
            method: 'PUT',
            url: '/api/profile/email',
            data: {
                newEmail: newEmail
            }
        }).then(function(response) {
            if (response.data.status === 'success') {
                console.log(response);
                passEmailService.setEmail(newEmail);
                $location.path('/confirm_code_email');
            } else {
                console.log(response.data);
            }
        }, function(err) {
            console.log(err);
        })
    };

    $scope.updateCellNumber = function() {

        if (isNaN($scope.newCell)) {
            console.log('New cell is not a number.');
            return;
        }

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
        }, function(err) {
            console.log(err);
        });
    };

    $scope.updatePassword = function() {

        if ($scope.passwordStrength <= 70) {
            console.log('Password is not strong enough.');
            return;
        }

        if ($scope.newPassword != $scope.confirmPassword) {
            console.log('New password and confirm new password do not match.');
            return;
        }

        $http({
            method: 'POST',
            url: '/api/profile/password',
            data: {
                newPassword: $scope.newPassword,
                confirmPassword : $scope.confirmPassword
            }
        }).then(function(response) {
            console.log(response);
            $scope.newPassword = '';
            $scope.confirmPassword = '';
        }, function(err) {
            console.log(err);
        })
    };

    $scope.$watch('newPassword', function(pass){

        $scope.passwordStrength = Password.getStrength(pass);
        $scope.strengthMessage = Password.getMessage($scope.passwordStrength);
    });

    $scope.isPasswordWeak = function(){
        return $scope.passwordStrength < 40;
    };

    $scope.isPasswordOk = function(){
        return $scope.passwordStrength >= 40 && $scope.passwordStrength <= 70;
    };
    $scope.isPasswordStrong = function(){
        return $scope.passwordStrength > 70;
    };

});

app.controller('ConfirmCodeEmailCtrl', function($scope, $http, $location, passEmailService, passAccessCode) {
    $scope.headerMsg = "Validate Access Code";
    $scope.dirMsg = "Please enter in the access code that was sent to you in email/text message.";

    $scope.submit = function() {
        var accessCode = $scope.accessCode;
        var newEmail = passEmailService.getEmail();

        $http({
            method: 'PUT',
            url: '/api/profile/email/validateAccessCode',
            data: {
                accessCode: accessCode,
                newEmail: newEmail
            }
        }).then(function(response) {
            if(response.data.status == "success"){
                console.log(response);
                $location.path('/profile');
            }else{
                $scope.headerMsg = "Invalid Access Code";
                $scope.dirMsg = "Please enter in a valid access code to confirm .";
                $scope.accessCode = "";
            }
        }, function(err) {
            console.log(err);
            $location.path('/login');   // assuming they are not logged in
        })
    }
});

app.controller('BeginRegistrationCtrl', function($scope, $http, $location, passEmailService){
    $scope.isSubmitDisabled = true;
    
    $scope.userExistsMsg = "";
    
   $scope.$watch('phonenumber', function(){
       if($scope.phonenumber.toString().length > 0 && $scope.firstname.length > 0 && $scope.lastname.length > 0 && $scope.email.length >0){
           $scope.isSubmitDisabled = false;
       }else{
          $scope.isSubmitDisabled = true; 
       }
   });
    
    $scope.register = function() {
        
        $http({
            method: 'POST',
            url: '/api/registration/beginRegistration',
            data: {
                firstname: $scope.firstname,
                lastname: $scope.lastname,
                email: $scope.email,
                phonenumber: $scope.phonenumber
            }
        }).then(function(response) {
            console.log(response);
            if(response.data.status == "success"){
                passEmailService.setEmail($scope.email);
                $location.path('/validateRegister');
            }else{
                $scope.userExistsMsg = "This email or phone number is already linked to a Grubbring account. Please use a different email and phone number."
                $scope.email = "";
                $scope.phonenumber = "";
            }
        }, function(err) {
            console.log(err);
            $location.path('/register'); 
        })
    }
});

app.controller('ConfirmCodeRegisterCtrl', function ($scope, $http, $location, passEmailService, passAccessCode){
    var email = "";
    $scope.isSubmitDisabled = true;
    $scope.isEmailVisible = false;
    var passedEmail = passEmailService.getEmail();
    if(passedEmail == ""){
        $scope.welcomeMsg = "Your account registration is incomplete. Please enter your email address and access code that was emailed to you to finish the registration process.";
        $scope.isEmailVisible = true;
    }else{
        $scope.welcomeMsg = "Enter the access code you received at "+passedEmail+" to complete the registration process.";
        $scope.isEmailVisible = false;
        email = passedEmail;
    }
    
    if($scope.isEmailVisible == true){
        $scope.$watch('accessCode', function(){
            if($scope.accessCode.length > 0 && $scope.email.length > 0){
                $scope.isSubmitDisabled = false;
            }else{
                $scope.isSubmitDisabled = true; 
            }
        });
    }
    if($scope.isEmailVisible == false){
        $scope.$watch('accessCode', function(){
            if($scope.accessCode.length > 0){
                $scope.isSubmitDisabled = false;
            }else{
                $scope.isSubmitDisabled = true; 
            }
        });
    }

    $scope.register = function() {
        
        if($scope.isEmailVisible == true){
            email = $scope.email;
        }
        
        $http({
            method: 'POST',
            url: '/api/registration/validateAccessCode',
            data: {
                accessCode: $scope.accessCode,
                email: email
            }
        }).then(function(response) {
            if(response.data.status == "success"){
                passEmailService.setEmail(email);
                passAccessCode.setAccessCode($scope.accessCode);
                $location.path('/finishRegister');
            }else{
                $scope.welcomeMsg = "You entered an incorrect access code for this email address. Please try again.";
            }
        }, function(err) {
            console.log(err);
            $location.path('/validateRegister'); 
        })
    }
    
});

app.controller('findRingsCtrl', function findRingsCtrl ($scope, $http, $location) {

    // get suggested rings to display to user
    $http({
        method: 'GET',
        url: '/api/ring/'
    }).then(function (response) {
        console.log(response);
    }, function (err) {
        console.log(err);
        $location.path('/find_rings');
    });

});
/***************steph********************/

/*Retrieves the ring details that the signed in user is a leader of */
app.controller('DashboardCtrl', function DashboardCtrl ($scope, $http, $location) {
    $scope.rings = null;
    $scope.sortedCounts = null;
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
            console.log($scope.userId);
            
            if(response.data.data == null) { //no rings call shivangs
                //bring up the find rings api
                $http({
                    method: 'GET',
                    url: '/api/ring'
                }).then(function (response) {
                    console.log(response);
                    $scope.ringId = response.data.ringId //rings you can join
                }, function (err) {
                    console.log(err);
                    $location.path('/dashboard');
                });
            } else {
                $scope.rings = response.data.data.ringsWithActivities;
                
                $scope.ringsWithOrders = response.data.data.ringsWithOrders;
                
                /*For each ring with activities, find if there is a tie, if there is a tie put the ring that has more orders at an index
                before the ring with less orders in the $scope.rings array*/
                var unsortedList = $scope.rings;
                var len = unsortedList.length;
                //assign numOrders to each ring with activities, sort numOrders within numActivities using insertion sort
                for(var i = 0; i < len; i++) {
                    var tempRing = unsortedList[i];
                    tempRing.numOrders = getNumOrders($scope.ringsWithOrders, tempRing.name);
                    /*Check through the sorted part and compare with the 
                     number in tmp. If large, shift the number*/
                    for(var j = i-1; j>=0 && (unsortedList[j].numOrders < tempRing.numOrders) && unsortedList[j].numActivities == tempRing.numActivities; j--) {
                        unsortedList[j+1] = unsortedList[j];
                    }
                    unsortedList[j+1] = tempRing;
                }
                
                for(i = 0; i < response.data.data.ringsWithNoActivities.length; i++) {
                   response.data.data.ringsWithNoActivities[i].numActivities = 0;
                   response.data.data.ringsWithNoActivities[i].numOrders = 0;
                   $scope.rings.push(response.data.data.ringsWithNoActivities[i]); 
                }
            }
        }, function (err) {
            console.log(err);
            $location.path('/dashboard');
        });
    }
   
});

function getNumOrders(ringsWithOrders, ringName) {
    for(var i = 0; i < ringsWithOrders.length; i++){
        if(ringsWithOrders[i].name == ringName) {
            return ringsWithOrders[i].numOrders;
        }
    }
}


/*Find rings */
app.controller('findRingsCtrl', function findRingsCtrl ($scope, $http, $location) {

    // get suggested rings to display to user
    $http({
        method: 'GET',
        url: '/api/ring/'
    }).then(function (response) {
        console.log(response);
    }, function (err) {
        console.log(err);
        $location.path('/find_rings');
    });

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

app.controller('TemplateCtrl', function($scope, $http, $location){

    // different search functionality for different pages
    $scope.searchBox = function(){
        //if location is /find_rings
        if($location.path()=='/find_rings'){
            if($scope.search.length >= 3){
                $http({
                    method: 'GET',
                    url: '/api/ring/search/'+$scope.search
                }).then(function (response) {
                    if(response.data.data.rings.length!=0 || response.data.data.leaders.length!=0){
                        console.log(response);
                    }
                    else{
                        console.log(response.data.description);
                    }
                }, function (err) {
                    console.log(err);
                });
            }
        }

    };

    // document.querySelector( "#nav-toggle" ).addEventListener( "click", function() {
    // this.classList.toggle( "active" );
    // });

    // document.addEventListener("touchstart", function(){}, true);
    

});

app.controller('BeginPasswordResetCtrl', function($scope, $http, $location, passEmailService){
    var email = null;
    $scope.isSubmitDisabled = true;
    $scope.headerMsg = "Forgot your password?";
    $scope.dirMsg = "Enter your email address or phone number to begin the process to reset your password.";
    $scope.$watch('email', function(){
       if($scope.email.length > 0){
           $scope.isSubmitDisabled = false;
       }else{
           $scope.isSubmitDisabled = true;
       }
   });
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
    $scope.isSubmitDisabled = true;
    $scope.headerMsg = "Validate Access Code";
    $scope.dirMsg = "Please enter in the access code that was sent to you in email/text message.";
    $scope.$watch('accessCode', function(){
       if($scope.accessCode.length > 0){
           $scope.isSubmitDisabled = false;
       }else{
           $scope.isSubmitDisabled = true;
       }
   });
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

app.controller('ResetPasswordCtrl', function($scope, $http, $location, passEmailService, passAccessCode, Password){
    
    if(passEmailService.getEmail() == "" || passAccessCode.getAccessCode() == ""){
        $location.path('/validateRegister');
    }    
    
    
   $scope.isSubmitDisabled = true;
   $scope.newPassword = "";
   $scope.retypenewPassword = "";
   $scope.strengthMessage = "";

   $scope.$watch('newPassword', function(pass){

       $scope.passwordStrength = Password.getStrength(pass);
       if($scope.passwordStrength != 0){
           if($scope.passwordStrength < 40){
                $scope.strengthMessage = "Weak";
                $scope.isRetypePasswordDisabled = true;

            }else if($scope.passwordStrength >= 40 && $scope.passwordStrength <= 70){
                $scope.strengthMessage = "Medium";
                $scope.isRetypePasswordDisabled = false;

            }else{
                $scope.strengthMessage = "Strong";
                $scope.isRetypePasswordDisabled = false;
            }
        }else{
            $scope.isRetypePasswordDisabled = true;
            $scope.strengthMessage = "";
        }
   });

   $scope.isPasswordWeak = function(){
       return $scope.passwordStrength < 40;
   }
   $scope.isPasswordOk = function(){
       return $scope.passwordStrength >= 40 && $scope.passwordStrength <= 70;
   }
   $scope.isPasswordStrong = function(){
       return $scope.passwordStrength > 70;
   }

   $scope.$watch('retypenewPassword', function(){
       if($scope.newPassword == $scope.retypenewPassword && $scope.newPassword.length > 0 && $scope.retypenewPassword.length > 0){
           $scope.isSubmitDisabled = false;
       }else{
           $scope.isSubmitDisabled = true;
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

app.factory('Password', function() {

    function getStrength(pass) {
	    var score = 0;
	    if (!pass)
	        return score;

	    // award every unique letter until 5 repetitions
	    var letters = new Object();
	    for (var i=0; i<pass.length; i++) {
	        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
	        score += 5.0 / letters[pass[i]];
	    }

	    // bonus points for mixing it up
	    var variations = {
	        digits: /\d/.test(pass),
	        lower: /[a-z]/.test(pass),
	        upper: /[A-Z]/.test(pass),
	        nonWords: /\W/.test(pass),
	    }

	    var variationCount = 0;
	    for (var check in variations) {
	        variationCount += (variations[check] == true) ? 1 : 0;
	    }
	    score += (variationCount - 1) * 10;

	    if(score > 100) score = 100;

	    return parseInt(score);
    }

    // Password strength display message
    function getMessage(strength) {
        if (strength != 0) {
            if (strength < 40) {
                return "Weak";
            } else if (strength <= 70) {
                return "Medium";
            } else {
                return "Strong";
            }
        } else {
            return "";
        }
    }

    return {
        getStrength: function(pass) {
            return getStrength(pass);
        },
        getMessage: getMessage
    }

	});