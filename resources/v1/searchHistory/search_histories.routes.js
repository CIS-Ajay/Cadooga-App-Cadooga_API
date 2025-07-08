const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog.js');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize.js');
const auth = new Authorize();

const SearchHistoryValidation = require('./search_histories.validation.js');
const validate = new SearchHistoryValidation();

const SearchHistoryController = require('./search_histories.controller.js');
const searchHistory = new SearchHistoryController();

/**
 * routes
 */

// routes.post('/',[auth.auth, validate.createOne],searchHistory.createOne);
routes.put('/',[auth.auth, validate.updateOne], searchHistory.updateOne);
routes.get('/',[auth.auth, validate.getAll], searchHistory.getAll);


module.exports = routes;