const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const ZodiacSignResource = require('./zodiac_signs.resources');
const _Zodiac = new ZodiacSignResource();


module.exports = class ZodiacSignValidation {
    
    async createOne(req, res, next) {
        console.log('ZodiacSignValidation@createOne');
        
        let schema = {
            receipt: Joi.string().optional(),
            platform: Joi.string().optional(),
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if(errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }
        next();
    }


    async updateOne(req, res, next) {
        console.log('ZodiacSignValidation@updateOne');
        if (!req.params.id || req.params.id === '') {
            return response.badRequest('Id required.', res, false);
        }
        // make sure the user exists
        let user = await _Zodiac.getOne(req.params.id);

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

}