const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();


module.exports = class NotificationValidation {

    async createOne(req, res, next) {
        console.log('NotificationValidation@createOne');        
        let schema = {
            
            name: Joi.string().optional(),
            description: Joi.string().optional(),
            tearms_condition: Joi.string().optional(),
            privacy: Joi.string().optional(),
            logo: Joi.string().optional()
        }
        let errors = await _DataHelper.joiValidation(req.body, schema);
        if(errors) {
            return response.badRequest('Invalid request data.', res, errors);
        }       
        req.body.user_id = req.user.id

        next();
    }

    async getOne(req,res,next){
        console.log("NotificationValidation@getOne")
        next()
    }
    
    async createLogo(req, res, next){
        console.log("NotificationValidation@createProfile")
        next()
    }

    async getAll(req, res, next) {
        console.log('ProfileLinkValidation@getAll');

        let paginateData = await _DataHelper.getPageAndLimit(req.query);
        req.body.page = paginateData.page;
        req.body.limit = paginateData.limit;
        
        next();
    }


}