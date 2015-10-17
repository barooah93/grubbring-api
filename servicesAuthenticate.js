module.exports = {
    
    checkAuthentication: function(request, response, callback){
        if(request.isAuthenticated() == true){
		    callback(response.status(200));
		    
	    }else{
		    var data = {
    	    	"status":"UNAUTHORIZED",
			    "message":"Please login using correct username and password"
		    };
		    response.status(401);
		    response.json(data);
	}
	
    }
    
}
