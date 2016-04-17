angular.module('grubbring.controllers').controller('ResetPasswordCtrl', function($scope, $http, $location, passEmailService, passAccessCode, Password) {

    if (passEmailService.getEmail() == "" || passAccessCode.getAccessCode() == "") {
        $location.path('/validateRegister');
    }


    $scope.isSubmitDisabled = true;
    $scope.newPassword = "";
    $scope.retypenewPassword = "";
    $scope.strengthMessage = "";

    $scope.$watch('newPassword', function(pass) {

        $scope.passwordStrength = Password.getStrength(pass);
        if ($scope.passwordStrength != 0) {
            if ($scope.passwordStrength < 40) {
                $scope.strengthMessage = "Weak";
                $scope.isRetypePasswordDisabled = true;

            } else if ($scope.passwordStrength >= 40 && $scope.passwordStrength <= 70) {
                $scope.strengthMessage = "Medium";
                $scope.isRetypePasswordDisabled = false;

            } else {
                $scope.strengthMessage = "Strong";
                $scope.isRetypePasswordDisabled = false;
            }
        } else {
            $scope.isRetypePasswordDisabled = true;
            $scope.strengthMessage = "";
        }
    });

    $scope.isPasswordWeak = function() {
        return $scope.passwordStrength < 40;
    }
    $scope.isPasswordOk = function() {
        return $scope.passwordStrength >= 40 && $scope.passwordStrength <= 70;
    }
    $scope.isPasswordStrong = function() {
        return $scope.passwordStrength > 70;
    }

    $scope.$watch('retypenewPassword', function() {
        if ($scope.newPassword == $scope.retypenewPassword && $scope.newPassword.length > 0 && $scope.retypenewPassword.length > 0) {
            $scope.isSubmitDisabled = false;
        } else {
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
            if (response.data.status == "success") {
                console.log(response);
                $location.path('/login');
            } else {
                alert("The 2 passwords aren't the same.");
            }
        }, function(err) {
            console.log(err);
            alert('Email Address does not exist');
        })
    }
});
