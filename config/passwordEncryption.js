var bcrypt = require('bcrypt');


module.exports = {

	generateHash: function(password){
		var salt = bcrypt.genSaltSync(5);
		var hash = bcrypt.hashSync(password, salt);
		return hash;

	},

//password 2 is the password in database
	validatePassword: function(loginPassword, realPassword){
		return bcrypt.compareSync(loginPassword, realPassword);

	}
}

