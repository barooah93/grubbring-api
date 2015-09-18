var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit : 100,
	host     : 'agrawalsites.com',
	user     : 'grublord',
	password : 'test2day',
	database : 'grubbring',
	debug    : false
});


module.exports.pool = pool;