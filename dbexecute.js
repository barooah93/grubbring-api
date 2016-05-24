var pool = require('./config/dbconnection.js').pool;
var glog = require('./glog.js')('dbexecute');
module.exports = {

// Function: Establish connection to database and execute the given query
// Parameters: query - string containing sql query to be executed
//			   res - response object from api
//             callback - function to return resultset when completed execution
/* Returns object with format: {status:'', description:'', data:''}
     Status - either 'error' or 'success'
     Description - description of status
     Data - the rows of the resultset (null if update, delete, etc) if success, detailed error otherwise
*/
    dbExecuteQuery: function(query, res, callback){
	    var resultObject;
	    pool.getConnection(function(err,connection){
			if(err){
				glog.log(err);
				resultObject = {status:"error", description:"Cannot connect to database", data:err};
				res.send(resultObject);
	//			callback(err,resultObject);
			}else if(connection && 'query' in connection){
				connection.query(query,function(err, rows, fields){
				    if(err){
				        glog.log(err);
				        resultObject = {status:"error", description:"Cannot execute query", data:err};
	//			        callback(err, resultObject);
				        res.send(resultObject);
				    }
				    else{
				        resultObject = {status:"success", description:"Executed query", data:rows};
				        callback(resultObject);
				    }
				});
				connection.release();
			}
		});


    }
}