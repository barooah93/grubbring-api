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
