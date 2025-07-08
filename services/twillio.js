module.exports = class TwillioService {

    constructor(){
        let accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
        let authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
        this.client = require('twilio')(accountSid, authToken, {
            lazyLoading: true
        });
    }

    async sendMessage(to, message){
        console.log("TwillioService@sendOtp")
        let from = process.env.TWILIO_PHONE_NO;
        
        // Send message using callback
        this.client.messages.create({
            from: from,
            to: to,
            body: message
        }, function(err, result) {
            if(err){
                return err
            }
            console.log('Created message using callback',result.sid);
            return result.sid
        });     
    }
}