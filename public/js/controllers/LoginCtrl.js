module.exports = function($scope, $http, $location, passEmailService) {

    $(function() {

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
                url: '/api/profile/loginAttempts/' + $scope.email,
            }).then(function(response) {
                var loginAttemptsRemain = response.data.loginAttempts;
                if (loginAttemptsRemain > 1) {
                    $scope.displayMsg1 = true;
                    $scope.loginAttemptMsg = "You have " + loginAttemptsRemain + " login attempts remaining before this account is locked.";
                }
                else if (loginAttemptsRemain == 1) {
                    $scope.displayMsg1 = true;
                    $scope.loginAttemptMsg = "You have " + loginAttemptsRemain + " login attempt remaining before this account is locked.";
                }
                else if (loginAttemptsRemain == 0 || loginAttemptsRemain < 0) {
                    $scope.displayMsg1 = true;
                    $scope.loginAttemptMsg = "You have attempted to login too many times using incorrect password. This account has been locked. Please reset your password.";
                    passEmailService.setEmail($scope.email);

                    //call api to send code to email address

                    $http({
                        method: 'POST',
                        url: '/api/profile/resetPassword/generateAccessCode',
                        data: {
                            email: $scope.email
                        }
                    }).then(function(response) {
                        if (response.data.status == "success") {
                            $location.path('/confirm_code_reset');
                        }
                    }, function(err) {
                        alert('Email Address does not exist');
                    })

                }
                else {
                    $scope.loginAttemptMsg = "This username or password is invalid.";
                }
                $scope.displayMsg2 = true;
            }), function(err) {

            }

        });
    }
};
