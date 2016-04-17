angular.module('grubbring.controllers').controller('BeginRegistrationCtrl', function($scope, $http, $location, passEmailService) {
    $scope.isSubmitDisabled = true;

    $scope.userExistsMsg = "";

    $scope.$watch('phonenumber', function() {
        if ($scope.phonenumber.toString().length > 0 && $scope.firstname.length > 0 && $scope.lastname.length > 0 && $scope.email.length > 0) {
            $scope.isSubmitDisabled = false;
        } else {
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
            if (response.data.status == "success") {
                passEmailService.setEmail($scope.email);
                $location.path('/validateRegister');
            } else {
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
