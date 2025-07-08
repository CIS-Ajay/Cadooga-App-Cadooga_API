const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const UsersPhoneResource = require('./user_phones.resources');
const _UserPhone = new UsersPhoneResource();


module.exports = class UserPhoneValidation {
    
    async createOne(req, res, next) {
        console.log('UserPhoneValidation@createOne');
        
        let schema = {
            phone_no:  Joi.number().integer().required(),
            phone_code: Joi.string().required()
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if(errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }

        next();
    }

    async verfiyPhone(req, res, next) {
        console.log('UserPhoneValidation@createOne');
        
        let schema = {
            id:  Joi.number().integer().required(),
            otp: Joi.number().integer().required(),
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if(errors) {
            return response.badRequest('Invalid request.', res, errors);
        }

        let phoneRecord = await _UserPhone.getOne(req.body.id);

        if(phoneRecord.otp !== req.body.otp){
            return response.notFound('OTP not matched.', res, false);
        }

        if(phoneRecord.is_verified == true){
            return response.conflict('Already verified.', res, false);
        }

        next();
    }

}