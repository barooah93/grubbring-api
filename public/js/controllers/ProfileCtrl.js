angular.module('grubbring.controllers').controller('ProfileCtrl', function($scope, $http, $location, Password, passEmailService) {
    onLoad();

    function onLoad() {
        $http({
            method: 'GET',
            url: '/api/profile'
        }).then(function(response) {
            console.log(response);
            $scope.user = response.data;
        }, function(err) {
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
        }).then(function(response) {
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
                confirmPassword: $scope.confirmPassword
            }
        }).then(function(response) {
            console.log(response);
            $scope.newPassword = '';
            $scope.confirmPassword = '';
        }, function(err) {
            console.log(err);
        })
    };

    $scope.$watch('newPassword', function(pass) {

        $scope.passwordStrength = Password.getStrength(pass);
        $scope.strengthMessage = Password.getMessage($scope.passwordStrength);
    });

    $scope.isPasswordWeak = function() {
        return $scope.passwordStrength < 40;
    };

    $scope.isPasswordOk = function() {
        return $scope.passwordStrength >= 40 && $scope.passwordStrength <= 70;
    };
    $scope.isPasswordStrong = function() {
        return $scope.passwordStrength > 70;
    };

});
