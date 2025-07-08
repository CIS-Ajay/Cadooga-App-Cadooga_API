const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const SocialStatusResource = require('./social_statuses.resources');
const _SocialStatus = new SocialStatusResource();


module.exports = class SocialStatusValidation {
    
    async createOne(req, res, next) {
        console.log('SocialStatusValidation@createOne');
        
        let schema = {
            firstname: Joi.string().required(),
            lastname: Joi.string().required(),
            phone_code: Joi.string().optional(),
            phone_no: Joi.string().optional().error(() => {
                return {
                  message: 'Phone number is not allowed to be empty',
                };
            }),
            gender: Joi.string().required().valid('male','female','other'),
            dob: Joi.string().required(),
            address: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            country: Joi.string().optional(),
            zipcode: Joi.string().optional(),
            allow_mobile_visit: Joi.number().integer().optional(),
            personal_statement: Joi.string().optional(),
            profile_photo: Joi.string().optional(),
            mission_statement: Joi.string().optional()
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if(errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }

        if(req.body.business_phone){
            let phoneNumber = req.body.business_phone;
            let errors = await _DataHelper.checkPhoneNumber(phoneNumber);
            if(errors) {
                return response.badRequest('Not valid phone number.', res, errors);
            }
        }

        next();
    }


    async updateOneBiometri(req, res, next) {
        console.log('SocialStatusValidation@updateOne');
        let schema = {
            is_biometric:Joi.boolean().required()
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if(errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }

        req.body.user_id = req.user.id;
        
        next();
    }


    async updateOne(req, res, next) {
        console.log('SocialStatusValidation@updateOne');
        let schema = {
            snapchat_status: Joi.boolean().optional(),
            tiktok_status: Joi.boolean().optional(),
            instagram_status: Joi.boolean().optional(),
            facebook_status: Joi.boolean().optional(),
            x_handle: Joi.boolean().optional(),
            theliveapp_status: Joi.boolean().optional(),
            linkdin_status: Joi.boolean().optional(),
            spotify_status: Joi.boolean().optional(),
            pitnerest_status: Joi.boolean().optional(),
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if(errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }

        next();
    }


    async getOneByUserId(req, res, next){
        console.log("SocialStatusValidation@getOneByUserId")
        next()
    }


    async createProfile(req, res, next){
        console.log("SocialStatusValidation@createProfile")
        next()
    }


}