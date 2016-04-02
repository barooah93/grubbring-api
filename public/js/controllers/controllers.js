(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function($scope, $http, $location) {
    $scope.userId = "";

    getUserDetails();

    function getUserDetails() {
        $http({
            method: 'GET',
            url: '/api/profile'
        }).then(function(response) {
            console.log(response);
            $scope.userId = response.data.userId
        }, function(err) {
            console.log(err);
            $location.path('/activities');
        });
    }

    $scope.createActivity = function() {
        $http({
            method: 'POST',
            url: '/api/activities/createActivity',
            data: {
                userId: $scope.userId,
                ringId: $scope.ringId,
                bringerUserId: $scope.bringerUserId,
                maxNumOrders: $scope.maxNumOrders,
                grubberyId: $scope.grubberyId,
                lastOrderDateTime: $scope.lastOrderDateTime
            }
        }).then(function(response) {
            console.log(response);
            $location.path('/activities');
        }, function(err) {
            console.log(err);
            $location.path('/activities');
        });
    }

};

},{}],2:[function(require,module,exports){
module.exports = function($scope, $http, $location, passEmailService) {
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

};

},{}],3:[function(require,module,exports){
module.exports = function($scope, $http, $location, passEmailService) {
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
};

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
module.exports = function($scope, $http, $location, passEmailService, passAccessCode) {
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

};

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
module.exports = function($scope, $http) {
    $http({
        method: 'GET',
        url: '/api/registration/confirmation'
    }).then(function(response) {
        console.log(response);
    }, function(err) {
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
            if (str == "Account has been confirmed.") { //they're the same - replace with status code later. also reg.js needs to be fixed.
                alert("you're confirmed! congrats");
            }
            else {
                alert("Account could not be confirmed");
            }

        }, function(err) {
            console.log(err);
        })

    }

};

},{}],8:[function(require,module,exports){
module.exports = function($scope, $http, $location) {
    $scope.rings = null;
    $scope.sortedCounts = null;
    getUserDetails();

    function getUserDetails() {
        $http({
            method: 'GET',
            url: '/api/profile'
        }).then(function(response) {
            console.log(response);
            $scope.userId = response.data.userId
            getRingsUserIsPartOf();
        }, function(err) {
            console.log(err);
            $location.path('/dashboard');
        });
    }

    function getRingsUserIsPartOf() {
        $http({
            method: 'GET',
            url: '/api/ring/subscribedRings/' + $scope.userId
        }).then(function(response) {
            console.log($scope.userId);

            if (response.data.data == null) { //no rings call shivangs
                //bring up the find rings api
                $http({
                    method: 'GET',
                    url: '/api/ring'
                }).then(function(response) {
                    console.log(response);
                    $scope.ringId = response.data.ringId //rings you can join
                }, function(err) {
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
                for (var i = 0; i < len; i++) {
                    var tempRing = unsortedList[i];
                    tempRing.numOrders = getNumOrders($scope.ringsWithOrders, tempRing.name);
                    /*Check through the sorted part and compare with the
                     number in tmp. If large, shift the number*/
                    for (var j = i - 1; j >= 0 && (unsortedList[j].numOrders < tempRing.numOrders) && unsortedList[j].numActivities == tempRing.numActivities; j--) {
                        unsortedList[j + 1] = unsortedList[j];
                    }
                    unsortedList[j + 1] = tempRing;
                }

                for (i = 0; i < response.data.data.ringsWithNoActivities.length; i++) {
                    response.data.data.ringsWithNoActivities[i].numActivities = 0;
                    response.data.data.ringsWithNoActivities[i].numOrders = 0;
                    $scope.rings.push(response.data.data.ringsWithNoActivities[i]);
                }
            }
        }, function(err) {
            console.log(err);
            $location.path('/dashboard');
        });
    }

    function getNumOrders(ringsWithOrders, ringName) {
        for(var i = 0; i < ringsWithOrders.length; i++){
            if(ringsWithOrders[i].name == ringName) {
                return ringsWithOrders[i].numOrders;
            }
        }
    }
};

},{}],9:[function(require,module,exports){
module.exports = function($scope, $http, $location) {

    // array containing rings near person's location
    $scope.nearbyRings = [];

    // initialize map canvas
    var mapCanvas = document.getElementById('map');
    var zoomLevel = 15;

    // Use this if customizing popup when hovering over marker --------------------------------
    // // div box for marker
    // var popup = $('#popup');

    // // intialize popup for markers
    // popup.hide();
    // popup.css('background-color', 'white');
    // popup.css('position','absolute');
    // popup.css('z-index',2);
    // --------------------------------------------------------------

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
    }
    else {
        alert('It seems like Geolocation, which is required for this page, is not enabled in your browser.');
    }

    // if successfully received long and lat 
    function successFunction(position) {
        // get client coordinates
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        // initialize geocoder for finding long and lat of an address
        var geocoder = new google.maps.Geocoder();

        // initialize options for map
        var mapOptions = {
            center: new google.maps.LatLng(lat, long),
            zoom: zoomLevel,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        // initialize google map object onto div mapCanvas with specified options
        var map = new google.maps.Map(mapCanvas, mapOptions);

        // decodes address into long and lat coordinates to add markers to the map
        function codeAddress(ring) {
            geocoder.geocode({'address': ring.addr + ' ' + ring.city + ', ' + ring.state}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    // add tooltip giving info about the ring
                    marker.setTitle(ring.name + "\n" + ring.addr + "\n" + ring.firstName + " " + ring.lastName);
                } else {
                    alert("We could not find nearby locations successfully: " + status);
                }
            });

        }

        // get suggested rings to display to user
        $http({
            method: 'GET',
            url: '/api/ring?latitude=' + lat + '&longitude=' + long
        }).then(function(response) {
            console.log(response);
            for (var i = 0; i < response.data.data.length; i++) {
                codeAddress(response.data.data[i]);
                $scope.nearbyRings.push(response.data.data[i]);
            }

        }, function(err) {
            console.log(err);
        });
    }

    function errorFunction(position) {
        console.log('Error!');
    }

};

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
module.exports = function($scope) {

};

},{}],12:[function(require,module,exports){
module.exports = function($scope, $http) {

    $scope.createOrder = function() {
        if ($scope.order.paymentStatus != 0 && $scope.order.paymentStatus != 1) {
            console.log('Payment Status can only be 1 (true) or 0 (false)');
            return;
        }
        $http({
            method: 'POST',
            url: '/api/orders/createOrder',
            data: $scope.order
        }).then(function(response) {
            console.log(response.data.description);
        }, function(error) {
            console.log(error);
        })
    }
};

},{}],13:[function(require,module,exports){
module.exports = function($scope, $http, $location, Password, passEmailService) {
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

};

},{}],14:[function(require,module,exports){
module.exports = function($scope, $http, $location, passEmailService, passAccessCode, Password) {

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
};

},{}],15:[function(require,module,exports){
module.exports = function($scope, $http, $location) {

    // different search functionality for different pages
    $scope.searchBox = function() {
        //if location is /find_rings
        if ($location.path() == '/find_rings') {
            if ($scope.search.length >= 3) {
                $http({
                    method: 'GET',
                    url: '/api/ring/search/' + $scope.search
                }).then(function(response) {
                    if (response.data.data.rings.length != 0 || response.data.data.leaders.length != 0) {
                        console.log(response);
                    }
                    else {
                        console.log(response.data.description);
                    }
                }, function(err) {
                    console.log(err);
                });
            }
        }

    };


    // document.querySelector( "#nav-toggle" ).addEventListener( "click", function() {
    // this.classList.toggle( "active" );
    // });

    // document.addEventListener("touchstart", function(){}, true);


};

},{}],16:[function(require,module,exports){
angular.module('grubbring.controllers', [])
    .controller('MainCtrl', require('./MainCtrl'))
    .controller('LoginCtrl', require('./LoginCtrl'))
    .controller('ProfileCtrl', require('./ProfileCtrl'))
    .controller('ConfirmCodeEmailCtrl', require('./ConfirmCodeEmailCtrl'))
    .controller('BeginRegistrationCtrl', require('./BeginRegistrationCtrl'))
    .controller('ConfirmCodeRegisterCtrl', require('./ConfirmCodeRegisterCtrl'))
    .controller('FindRingsCtrl', require('./findRingsCtrl'))
    .controller('ActivityCtrl', require('./ActivityCtrl'))
    .controller('DashboardCtrl', require('./DashboardCtrl'))
    .controller('ConfirmationCtrl', require('./ConfirmationCtrl'))
    .controller('TemplateCtrl', require('./TemplateCtrl'))
    .controller('BeginPasswordResetCtrl', require('./BeginPasswordResetCtrl'))
    .controller('ConfirmCodeResetCtrl', require('./ConfirmCodeResetCtrl'))
    .controller('ResetPasswordCtrl', require('./ResetPasswordCtrl'))
    .controller('OrdersCtrl', require('./OrdersCtrl'))

},{"./ActivityCtrl":1,"./BeginPasswordResetCtrl":2,"./BeginRegistrationCtrl":3,"./ConfirmCodeEmailCtrl":4,"./ConfirmCodeRegisterCtrl":5,"./ConfirmCodeResetCtrl":6,"./ConfirmationCtrl":7,"./DashboardCtrl":8,"./FindRingsCtrl":9,"./LoginCtrl":10,"./MainCtrl":11,"./OrdersCtrl":12,"./ProfileCtrl":13,"./ResetPasswordCtrl":14,"./TemplateCtrl":15}]},{},[16]);
