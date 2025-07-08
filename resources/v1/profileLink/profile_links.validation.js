const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const ProfileLinkResource = require('./profile_links.resources');
const _ProfileLink = new ProfileLinkResource();


module.exports = class ProfileLinkValidation {
    
    async createOne(req, res, next) {
        console.log('UserAddressValidation@createOne');
        
        let schema = {
            link_date: Joi.string().optional(),
            link_user_id: Joi.number().integer().optional()
        }

        let errors = await _DataHelper.joiValidation(req.body, schema);

        if(errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }
        next();
    }


    async updateOne(req, res, next) {
        console.log('ProfileLinkValidation@updateOne');
        if (!req.params.id || req.params.id === '') {
            return response.badRequest('Id required.', res, false);
        }
        // make sure the user exists
        let user = await _ProfileLink.getOne(req.params.id);
        
        if (!user) {
            return response.notFound('Profile link Not found', res, false);
        };

        next();
    }


    async getAll(req, res, next) {
        console.log('ProfileLinkValidation@getAll');
        let paginateData = await _DataHelper.getPageAndLimit(req.query);
        req.body.page = paginateData.page;
        req.body.limit = paginateData.limit;
        next();
    }

    async userUnlink(req, res, next) {
        console.log('ProfileLinkValidation@userUnlink');
        next();
    }

    async unlinkAll(req, res, next) {
        console.log('ProfileLinkValidation@unlinkAll');
        next();
    }

}