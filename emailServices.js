var nodemailer = require('nodemailer');
var debug = require('debug')('grubbring:emailServices');

module.exports = {
    
    emailTokenToUser: function(emailMessage, emailSubject, user_email){
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
    	    subject: emailSubject, // Subject line
    	    text: emailMessage
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