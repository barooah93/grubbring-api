angular.module('grubbring.controllers').controller('BeginPasswordResetCtrl', function($scope, $http, $location, passEmailService) {
    var email = null;
    $scope.isSubmitDisabled = true;
    $scope.headerMsg = "Forgot your password?";
    $scope.dirMsg = "Enter your email address or phone number to begin the process to reset your password.";
    $scope.$watch('email', function() {
        if ($scope.email.length > 0) {
            $scope.isSubmitDisabled = false;
        } else {
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
            if (response.data.status == "success") {
                $location.path('/confirm_code_reset');
                passEmailService.setEmail(email);
            } else {
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
