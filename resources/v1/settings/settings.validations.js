const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const SettingResource = require('./settings.resources');
const _Setting = new SettingResource();

module.exports = class SettingValidation {

    async createOne(req, res, next) {
        console.log('SettingValidation@createOne');        
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
        console.log("SettingValidation@getOne")
        next()
    }
    
    async createLogo(req, res, next){
        console.log("UserProfileValidation@createProfile")
        next()
    }


}