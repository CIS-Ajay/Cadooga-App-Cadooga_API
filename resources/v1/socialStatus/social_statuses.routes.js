const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize');
const auth = new Authorize();

const SocialStatusValidation = require('./social_statuses.validation');
const validate = new SocialStatusValidation();

const SocialStatusController = require('./social_statuses.controller');
const socialStatus = new SocialStatusController();


/**
 * routes
 */

routes.put('/',[auth.auth, validate.updateOne],socialStatus.updateOne);



module.exports = routes;