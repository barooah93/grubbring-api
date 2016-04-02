/**
 * Created by Urvesh on 10/15/15.
 */
/*global angular */
var app = angular.module('grubbring', [
    'controllers',
    'ngRoute',
    'ui.bootstrap'
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
        .when('/confirm_code_email', {
            templateUrl: 'partials/confirm_code_reset.html',
            controller: 'ConfirmCodeEmailCtrl'
        })
        .when('/begin_register', {
            templateUrl: 'partials/register.html',
            controller: 'BeginRegistrationCtrl'
        })
        .when('/validateRegister', {
            templateUrl: 'partials/validateRegister.html',
            controller: 'ConfirmCodeRegisterCtrl'
        })
        .when('/finishRegister', {
            templateUrl: 'partials/finishRegister.html',
            controller: 'ResetPasswordCtrl'
        })
         .when('/find_rings', {
            templateUrl: 'partials/find_rings.html',
            controller: 'findRingsCtrl'
        })
        .when('/activities', {
            templateUrl: 'partials/activities.html',
            controller: 'ActivityCtrl'
        })
        .when('/confirmation', {
            templateUrl: 'partials/confirmation.html',
            controller: 'ConfirmationCtrl'
        })
        .when('/dashboard', {
            templateUrl: 'partials/dashboard.html',
            controller: 'DashboardCtrl'
        })
        .when('/template', { //NOTE: Remove when all pages complete, here as a placeholder for now
            templateUrl: 'partials/template.html',
            controller: 'TemplateCtrl'
        })
        .when('/begin_password_reset', {
            templateUrl: 'partials/begin_password_reset.html',
            controller: 'BeginPasswordResetCtrl'
        })
        .when('/confirm_code_reset', { 
            templateUrl: 'partials/confirm_code_reset.html',
            controller: 'ConfirmCodeResetCtrl'
        })
        .when('/reset_password', {
            templateUrl: 'partials/reset_password.html',
            controller: 'ResetPasswordCtrl'
        })
        .when('/orders', {
            templateUrl: 'partials/orderForm.html',
            controller: 'OrdersCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

