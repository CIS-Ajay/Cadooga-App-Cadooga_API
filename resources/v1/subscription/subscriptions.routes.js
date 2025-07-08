const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog.js');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize.js');
const auth = new Authorize();

const SubscriptionValidation = require('./subscriptions.validation.js');
const validate = new SubscriptionValidation();

const SubscriptionController = require('./subscriptions.controller.js');
const subscription = new SubscriptionController();

/**
 * routes
 */

routes.post('/',[auth.auth, validate.createOne],subscription.createOne);


module.exports = routes;