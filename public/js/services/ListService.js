var app = angular.module('grubbring.services');

app.service('ListService', ['$http','RingService','GrubberyService','LoaderService', function($http, RingService,GrubberyService,LoaderService) {
    
    var listItems = null;

    return {

        ClearListItems : ClearListItems,
        GetListItems: GetListItems,
       // SetListItems: SetListItems
        
    };
    
    function ClearListItems() {
        listItems = null;
    }
    
    function GetListItems() {
        return new Promise(function(resolve, reject) {
            // Hide spinner
            LoaderService.notifyHideLoader();
            if(listItems == null) {
                RingService.GetNearbyRings().then(function(ringArray) {
                    console.log("ring array " + JSON.stringify(ringArray));
                    GrubberyService.GetNearbyGrubberies().then(function(grubberyArray) {
                        console.log("grubbery array " + JSON.stringify(grubberyArray));
                        listItems = ringArray.concat(grubberyArray);
                        resolve(listItems);
                    });
                });
            } else {
                resolve(listItems);
            }
        });
    }
    
   /* function SetListItems() {
        RingService.GetNearbyRings().then(function(ringArray) {
            console.log("ring array " + JSON.stringify(ringArray));
            GrubberyService.GetNearbyGrubberies().then(function(grubberyArray) {
                console.log("grubbery array " + JSON.stringify(grubberyArray));
                listItems = ringArray.concat(grubberyArray);
            });
        });
    }*/
}]);