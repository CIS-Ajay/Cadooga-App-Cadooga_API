const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog.js');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize.js');
const auth = new Authorize();

const ZodiacSignValidation = require('./zodiac_signs.validation.js');
const validate = new ZodiacSignValidation();

const ZodiacSignController = require('./zodiac_signs.controller.js');
const zodiac = new ZodiacSignController();

/**
 * routes
 */

routes.post('/',[auth.auth, validate.createOne],zodiac.createOne);


module.exports = routes;