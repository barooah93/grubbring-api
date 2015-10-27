/**
 * Created by Urvesh on 10/15/15.
 */
/*global angular */
var app = angular.module('grubbring', [
    'controllers',
    'ngRoute'
]);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        })
        .when('/profile', {
            templateUrl: 'partials/profile.html',
            controller: 'ProfileCtrl'
        })
        .when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'RegistrationCtrl'
        })
        .when('/dashboard', {
            templateUrl: 'partials/dashboard.html',
            controller: 'DashboardCtrl'
        })
        .when('/confirmation', {
            templateUrl: 'partials/confirmation.html',
            controller: 'ConfirmationCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

