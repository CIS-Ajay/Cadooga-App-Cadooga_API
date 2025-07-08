const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const UserProfilesResource = require('./user_profiles.resources');
const _UserProfile = new UserProfilesResource();


module.exports = class UserProfilesValidation {
    
    async createOne(req, res, next) {
        console.log('UserProfilesValidation@createOne');
        
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
        console.log('UserProfilesValidation@updateOne');
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
        console.log('UserProfilesValidation@updateOne');
        if (!req.params.id || req.params.id === '') {
            return response.badRequest('Id required.', res, false);
        }

        // make sure the user exists
        let userProfile = await _UserProfile.getOne(req.params.id);

        if(!userProfile) {
            return response.notFound('Not found.', res, false);
        };

        let schema = {
            firstname: Joi.string().required(),
            lastname: Joi.string().required(),
            personal_statement: Joi.string().optional().allow(null,''),
            //gender: Joi.string().required().valid('male','female','other'),
            dob: Joi.string().optional().allow(null,''),
            address: Joi.string().optional().allow(null,''),
            city: Joi.string().optional().allow(null,''),
            state: Joi.string().optional().allow(null,''),
            zipcode: Joi.string().optional().allow(null,''),
            phone_code: Joi.string().optional(),
            phone_no: Joi.string().optional().error(() => {
                return {
                  message: 'Phone number is not allowed to be empty',
                };
            }),
            profile_photo: Joi.string().optional().allow(null,''),
            mission_statement: Joi.string().optional().allow(null,''),
            allow_mobile_visit: Joi.number().integer().optional().allow(null,''),
            relation_id: Joi.number().integer().optional().allow(null,''),
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if(errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }

        // if(req.body.business_phone){
        //     let phoneNumber = req.body.business_phone;
        //     let errors = await _DataHelper.checkPhoneNumber(phoneNumber);
        //     if(errors) {
        //         return response.badRequest('not valid phone number', res, errors);
        //     }
        // }

        req.userProfile = userProfile;

        next();
    }

    async updateFullname(req, res, next) {
        console.log('UserProfilesValidation@updateOne');
        if (!req.params.id || req.params.id === '') {
            return response.badRequest('Id required.', res, false);
        }
        
        // make sure the user exists
        let userProfile = await _UserProfile.getUserId(req.params.id);
       
       
        if(!userProfile) {
            return response.notFound('Not found.', res, false);
        };

        let schema = {
            fullname: Joi.string().required(),
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if(errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }

        // if(req.body.business_phone){
        //     let phoneNumber = req.body.business_phone;
        //     let errors = await _DataHelper.checkPhoneNumber(phoneNumber);
        //     if(errors) {
        //         return response.badRequest('not valid phone number', res, errors);
        //     }
        // }

        req.userProfile = userProfile;

        next();
    }

    async getOneByUserId(req, res, next){
        console.log("UserProfilesValidation@getOneByUserId")
        next()
    }

    async createProfile(req, res, next){
        console.log("UserProfileValidation@createProfile")
        next()
    }


}