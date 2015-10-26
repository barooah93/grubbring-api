var nodemailer = require('nodemailer');
var debug = require('debug')('grubbring:emailServices');

module.exports = {
    
    emailTokenToUser: function(user_token, user_email){
        //your app url instead of "https://grubbring-api-sshah0930-1.c9.io/"
	    var registrationConfirmationUrl = "https://grubbring-api-sshah0930-1.c9.io/api/registration/confirmation";

	    var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'grubbring@gmail.com', // sender's email id
                pass: 'test2day' // sender's password
            }
        });

        var mailOptions = {
        	from: '<grubbring@gmail.com>', // sender address
    	    to: '<'+user_email+'>', // list of receivers
    	    subject: 'Registration Confirmation Email', // Subject line
    	    text: "Enter Confirmation Code at : "+registrationConfirmationUrl+" Confirmation Code : " + user_token 
    	};  

	    transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
    	        debug('Confirmation email sent: ' + info.response);
                // console.log('Message sent: ' + info.response);
            };
        });
    }
    
}