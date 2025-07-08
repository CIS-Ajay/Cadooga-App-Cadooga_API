const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize');
const auth = new Authorize();

const UsersPhoneValidation = require('./user_phones.validation');
const validate = new UsersPhoneValidation();

const UsersPhoneController = require('./user_phones.controller.js');
const userPhone = new UsersPhoneController();

/**
 * routes
 */

routes.post('/',[validate.createOne],userPhone.createOne);
routes.post('/verify-phone', [validate.verfiyPhone],userPhone.verfiyPhone);


module.exports = routes;