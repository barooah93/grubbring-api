angular.module('grubbring.controllers').controller('ConfirmCodeRegisterCtrl', function($scope, $http, $location, passEmailService, passAccessCode) {
    var email = "";
    $scope.isSubmitDisabled = true;
    $scope.isEmailVisible = false;
    var passedEmail = passEmailService.getEmail();
    if (passedEmail == "") {
        $scope.welcomeMsg = "Your account registration is incomplete. Please enter your email address and access code that was emailed to you to finish the registration process.";
        $scope.isEmailVisible = true;
    } else {
        $scope.welcomeMsg = "Enter the access code you received at " + passedEmail + " to complete the registration process.";
        $scope.isEmailVisible = false;
        email = passedEmail;
    }

    if ($scope.isEmailVisible == true) {
        $scope.$watch('accessCode', function() {
            if ($scope.accessCode.length > 0 && $scope.email.length > 0) {
                $scope.isSubmitDisabled = false;
            } else {
                $scope.isSubmitDisabled = true;
            }
        });
    }
    if ($scope.isEmailVisible == false) {
        $scope.$watch('accessCode', function() {
            if ($scope.accessCode.length > 0) {
                $scope.isSubmitDisabled = false;
            } else {
                $scope.isSubmitDisabled = true;
            }
        });
    }

    $scope.register = function() {

        if ($scope.isEmailVisible == true) {
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
            if (response.data.status == "success") {
                passEmailService.setEmail(email);
                passAccessCode.setAccessCode($scope.accessCode);
                $location.path('/finishRegister');
            } else {
                $scope.welcomeMsg = "You entered an incorrect access code for this email address. Please try again.";
            }
        }, function(err) {
            console.log(err);
            $location.path('/validateRegister');
        })
    }

});
