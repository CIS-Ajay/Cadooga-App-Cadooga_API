const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const UserPicResource = require('./user_pics.resources');
const _UserPic = new UserPicResource();


module.exports = class UserPicValidation {
    
    async createOne(req, res, next) {
        console.log('UserPicValidation@createOne');
        next();
    }

    async updateOne(req, res, next) {
        console.log('UserPicValidation@updateOne');
        if (!req.params.id || req.params.id === '') {
            return response.badRequest('Id required.', res, false);
        }
        next();
    }


    async getOne(req, res, next) {
        console.log('UserPicValidation@getOne');
        if (!req.params.id || req.params.id === '') {
            return response.badRequest('Id required.', res, false);
        }

        // make sure the user exists
        let userPic = await _UserPic.getOne(req.params.id);

        if (!userPic) {
            return response.notFound('Not found.', res, false);
        };

        next();
    }

    async getAll(req, res, next) {
        console.log('UserPicValidation@getAll');
        next();
    }

    async deleteOne(req, res, next) {
        console.log('UserPicValidation@deleteOne');
        if (!req.params.id || req.params.id === '') {
            return response.badRequest('Id required.', res, false);
        }
        next();
    }

}