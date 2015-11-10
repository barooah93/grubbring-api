var emailServices = require('./emailServices');
var crypto = require('crypto');
var mysql = require('mysql');
var db = require('./dbexecute');

module.exports = {
    
    generateAccessCode: function(emailAddress, callback){
        
        var accessCode = crypto.randomBytes(7).toString('hex');
        var newEmailObj = {
                emailAddress: emailAddress,
                subject: 'Grubbring - Reset Password Access Code',
                msg: 'Enter in this access code to reset your password: ' + accessCode
            };
        console.log(accessCode);
        emailServices.sendEmail(newEmailObj.msg, newEmailObj.subject, newEmailObj.emailAddress);
        callback(accessCode);
    },
    
    validateAccessCode: function(emailAddress,accessCode,response,callback){
        var sql = "SELECT * FROM tblUser WHERE emailAddr=? AND accessCode=?;"
        var inserts = [emailAddress, accessCode];
        sql = mysql.format(sql, inserts);
        
        db.dbExecuteQuery(sql,response,function(result) {
        if(result.data.length > 0){
            result.description = "This is a valid access code assigned to this user."
            callback(result);
        }else{
            result.description = "This is an invalid access code for this user."
            result.status = "fail";
            callback(result);
        }
    });
        
    },
    
    resetPassword: function(emailAddress, accessCode, encryptedPassword,response, callback){
        var status = "active";
        var loginAttempts = 3;
        
        var sql = "UPDATE tblUser SET password=?,accountStatus=?,loginAttempts=? WHERE emailAddr=? AND accessCode=?;";
        var inserts = [encryptedPassword,status,loginAttempts, emailAddress, accessCode];
        sql = mysql.format(sql, inserts);
        
        db.dbExecuteQuery(sql,response,function(result) {
            callback(result);
        });
    }
    
}