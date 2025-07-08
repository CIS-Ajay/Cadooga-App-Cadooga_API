const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const UsersAddressResource = require('./user_addresses.resources');
const _UserAddress = new UsersAddressResource();


module.exports = class UserAddressValidation {
    
    async createOne(req, res, next) {
        console.log('UserAddressValidation@createOne');
        
        let schema = {
            address_name: Joi.string().optional(),
            latitude: Joi.string().required(),
            longitude: Joi.string().required(),
            formated_address: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            zipcode: Joi.string().optional(),
            country: Joi.string().optional()
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if(errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }
        next();
    }


    async updateOne(req, res, next) {
        console.log('UserValidation@updateOne');
        if (!req.params.id || req.params.id === '') {
            return response.badRequest('Id required.', res, false);
        }
        // make sure the user exists
        let user = await _UserAddress.getOne(req.params.id);

        if (!user) {
            return response.notFound('Not found.', res, false);
        };

        let schema = {
            address_name: Joi.string().optional(),
            latitude: Joi.string().optional(),
            longitude: Joi.string().optional(),
            formated_address: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            zipcode: Joi.string().optional(),
            country: Joi.string().optional()
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if (errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }

        next();
    }

    // async verfiyPhone(req, res, next) {
    //     console.log('UserAddressValidation@createOne');
        
    //     let schema = {
    //         id:  Joi.number().integer().required(),
    //         otp: Joi.number().integer().required(),

    //     }

    //     let errors = await _DataHelper.joiValidation(req.body, schema);

    //     if(errors) {
    //         return response.badRequest('Invalid request.', res, errors);
    //     }

    //     let phoneRecord = await _UserAddress.getOne(req.body.id);

    //     if(phoneRecord.otp !== req.body.otp){
    //         return response.notFound('OTP not matched.', res, false);
    //     }

    //     if(phoneRecord.is_verified == true){
    //         return response.conflict('Already verified.', res, false);
    //     }

    //     next();
    // }

}