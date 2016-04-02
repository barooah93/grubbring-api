module.exports = function($scope, $http, $location, passEmailService, passAccessCode) {
    $scope.isSubmitDisabled = true;
    $scope.headerMsg = "Validate Access Code";
    $scope.dirMsg = "Please enter in the access code that was sent to you in email/text message for " + passEmailService.getEmail() + ".";
    $scope.$watch('accessCode', function() {
        if ($scope.accessCode.length > 0) {
            $scope.isSubmitDisabled = false;
        } else {
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
            if (response.data.status == "success") {
                console.log(response);
                passAccessCode.setAccessCode(accessCode);
                $location.path('/reset_password');
            } else {
                $scope.headerMsg = "Invalid Access Code";
                $scope.dirMsg = "Please enter in a valid access code to reset your password.";
                $scope.accessCode = "";
            }
        }, function(err) {
            console.log(err);
            alert('Email Address does not exist');
        })
    }
};
