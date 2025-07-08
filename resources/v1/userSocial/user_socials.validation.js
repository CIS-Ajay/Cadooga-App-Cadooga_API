const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const UserSocialsResource = require('./user_socials.resources');
const _UserSocial = new UserSocialsResource();


module.exports = class UserSocialsValidation {
    
    async createOne(req, res, next) {
        console.log('UserSocialsValidation@createOne');
        
        let schema = {
            facebook:  Joi.string().optional(),
            instagram: Joi.string().optional(),
            x_handle:  Joi.string().optional(),
            tiktok:  Joi.string().optional(),
            snapchat:  Joi.string().optional(),
            theliveapp:  Joi.string().optional(),
            linkedin:  Joi.string().optional(),
            spotify:  Joi.string().optional(),
            pitnerest:  Joi.string().optional()
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
        let userSocial = await _UserSocial.getOne(req.params.id);

        if (!userSocial) {
            return response.notFound('Not found.', res, false);
        };

        let schema = {
            facebook:  Joi.string().optional(),
            instagram: Joi.string().optional(),
            x_handle:  Joi.string().optional(),
            tiktok:  Joi.string().optional(),
            snapchat:  Joi.string().optional(),
            theliveapp:  Joi.string().optional(),
            linkedin:  Joi.string().optional(),
            spotify:  Joi.string().optional(),
            pitnerest:  Joi.string().optional()
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if (errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }

        next();
    }


    async getOne(req, res, next) {
        console.log('UserSocialsValidation@getOne');
        if (!req.params.id || req.params.id === '') {
            return response.badRequest('Id required.', res, false);
        }

        // make sure the user exists
        let userSocial = await _UserSocial.getOne(req.params.id);

        if (!userSocial) {
            return response.notFound('Not found.', res, false);
        };

        next();
    }


    async getAll(req, res, next) {
        console.log('UserSocialsValidation@getAll');

        let paginateData = await _DataHelper.getPageAndLimit(req.query);

        req.body.page = paginateData.page;
        req.body.limit = paginateData.limit;
        
        next();
    }


    async validateUserName(req, res, next) {
        let schema = {
          user_name: Joi.string().min(3).required(),
        };
        let errors = await _DataHelper.joiValidation(req.body, schema);
    
        if (errors) {
          return response.badRequest("Invalid request data.", res, errors);
        }
    
        next();
      }

}