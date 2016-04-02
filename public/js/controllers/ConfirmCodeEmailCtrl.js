module.exports = function($scope, $http, $location, passEmailService, passAccessCode) {
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
            if (response.data.status == "success") {
                console.log(response);
                $location.path('/profile');
            } else {
                $scope.headerMsg = "Invalid Access Code";
                $scope.dirMsg = "Please enter in a valid access code to confirm .";
                $scope.accessCode = "";
            }
        }, function(err) {
            console.log(err);
            $location.path('/login');   // assuming they are not logged in
        })
    }
};
