var app = angular.module('grubbring.services');

app.service('LoaderService', function($rootScope) {
    return {
        subscribeShowLoader: function(scope, callback) {
            var handler = $rootScope.$on('show-loader-event', callback);
            scope.$on('$destroy', handler);
        },

        notifyShowLoader: function() {
            $rootScope.$emit('show-loader-event');
        },
        
        subscribeHideLoader: function(scope, callback) {
            var handler = $rootScope.$on('hide-loader-event', callback);
            scope.$on('$destroy', handler);
        },

        notifyHideLoader: function() {
            $rootScope.$emit('hide-loader-event');
        }
    };
});