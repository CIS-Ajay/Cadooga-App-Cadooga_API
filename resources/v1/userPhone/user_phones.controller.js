const _ = require('lodash');

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const UserPhonesResource = require('./user_phones.resources');
// const { AssistantFallbackActionsPage } = require('twilio/lib/rest/preview/understand/assistant/assistantFallbackActions');
const _UserPhone = new UserPhonesResource();

// const TwilioService = require('../../../services/twillio')
// const _Twilio = new TwilioService()

module.exports = class UserPhonesController {
    
    async createOne(req,res){

        console.log("UserPhonesController@createOne");

        let data = _.pick(req.body,['phone_no', 'phone_code']);
        let otp = Math.floor(Math.random() * 10000)

        let userphone = await _UserPhone.createOne({
            "phone_no" : data.phone_code + data.phone_no,
            "otp" : otp
        }); 

        //let sendMessage = await _Twilio.sendMessage(to,message);
        return response.success('Message sent successfully.', res, {
            id : userphone.id
        });
    }

    async verfiyPhone(req, res){
        console.log("UserPhonesController@verfiyPhone");
        let data = _.pick(req.body,['id']);

        let userphone = await _UserPhone.updateOne(data.id,{
            "is_verified": true
        });
        
        if(userphone !== true){
            return response.conflict('Something went wrong.', res, false);
        }

        return response.success('OTP matched.', res, true);

    }
}   