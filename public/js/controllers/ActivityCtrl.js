angular.module('grubbring.controllers').controller('ActivityCtrl', function ActivityCtrl($scope, $http, $location) {
    $scope.userId = "";

    // TODO - copy onSearchTextChanged() function from rings page

    getUserDetails();

    // Load rings that I'm in --
    // when I click a ring - show the activities on the right side
    onLoad();

    function onLoad() {
        $http({
            method: 'GET',
            url: '/api/ring/subscribedRings'
        }).then(function(response) {
            console.log(response);
            $scope.myRings = response.data.data;
        }, function(error) {
            console.log(error);
        });

        $http({
            method: 'GET',
            url: '/api/activities'
        }).then(function(response) {
            console.log(response);
            $scope.activityFeed = response.data.data;
        }, function(error) {
            console.log(error);
        })
    }

    $scope.orderActivityFeed = function(activity) {
        var endDate = new Date(activity.lastOrderDateTime);     // returns time in milliseconds
        var now = new Date();
        var remaining = endDate - now;
        return -remaining;    // reverse order (longest time remaining on top)
    };

    // If activity is still open - show the two buttons
    $scope.isOpen = function(activity) {
        var endDate = new Date(activity.lastOrderDateTime);
        var now = new Date();
        var remaining = endDate - now;
        if (remaining > 0 && activity.remainingOrders > 0) {
            return true;
        } else {
            return false;
        }
    };



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
    };

    $scope.updateActivity = function() {
        $http({
            method: 'POST',
            url: '/api/activities/updateActivity',
            data: {
                maxNumOrders: $scope.maxNumOrders,
                lastOrderDateTime: $scope.lastOrderDateTime,
                bringerUserId: $scope.bringerUserId,
                grubberyId: $scope.grubberyId,
                activityId: $scope.activityId
            }
        }).then(function(response) {
            console.log(response);
            $location.path('/activities');
        }, function(err) {
            console.log(err);
            $location.path('/activities');
        });
    }

}).filter('displayText', function() {
    return function(activity) {
        var displayText = '';
        var endTime = new Date(activity.lastOrderDateTime);
        var now = new Date();

        var remaining = endTime - now;

        if (remaining < 0) {
            var day = endTime.getDay();
            var month = endTime.getMonth() + 1;
            var date = endTime.getDate();
            var year = endTime.getFullYear();

            var dayMapper = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var dateString = dayMapper[day] + ' '+ month + '/' + date + '/' + year;

            displayText = activity.firstName + ' posted an activity for ' + activity.grubberyName + ' in ' + activity.ringName + ' on ' + dateString + '. ';
            displayText += activity.maxNumOrders - activity.remainingOrders + ' grubbrings joined this activity';
        } else {
            var seconds = Math.round(remaining / 1000); // ex. 10077
            var minutes = parseInt(seconds / 60, 10); // ex 10077 to 167.95 to 167
            seconds = seconds % 60;

            displayText = activity.firstName + ' posted an activity for ' + activity.grubberyName + ' in ' + activity.ringName + '. ' +
                'There are ' + activity.remainingOrders + ' open orders and ' + minutes + ' minutes and ' + seconds + ' seconds left to join!';
        }
        return displayText;


    //    TODO there is some bug with the activities
    //    Created an activity with 50 max order numbers and it shows remaining order num as 24?
    }
});
