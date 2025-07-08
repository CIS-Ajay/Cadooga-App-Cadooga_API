const _ = require('lodash');
const Joi = require('joi');
const DataHelpers = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelpers();

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const SearchHistoryResource = require('./search_histories.resources');
const _SearchHistory = new SearchHistoryResource();


module.exports = class SearchHistoryValdation {
    
    async updateOne(req, res, next) {
       console.log("UserValidation@updateOne");
       const searchId = req.body.id;
   
       if (!searchId) {
         return response.badRequest("Id required.", res, false);
       }
   
       // make sure the user exists
       let searchHistory = await _SearchHistory.getOne(searchId);
   
       if (!searchHistory) {
         return response.notFound("Not found.", res, false);
       }
   
       let schema = {
         id: Joi.number().integer().required(),
         is_soft_delete: Joi.number().integer().required()
       };
   
       let errors = await _DataHelper.joiValidation(req.body, schema);
   
       if (errors) {
         return response.badRequest("Invalid request data.", res, errors);
       }
   
       next();
     }
   

    async getAll(req, res, next) {
        console.log('SearchHistoryValdation@getAll');

        let paginateData = await _DataHelper.getPageAndLimit(req.query);
        req.body.page = paginateData.page;
        req.body.limit = paginateData.limit;
        next();
    }


}