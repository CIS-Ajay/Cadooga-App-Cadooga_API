const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog.js');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize.js');
const auth = new Authorize();

const UsersAddressValidation = require('./user_addresses.validation.js');
const validate = new UsersAddressValidation();

const UsersAddressController = require('./user_addresses.controller.js');
const userAddress = new UsersAddressController();

/**
 * routes
 */

// routes.post('/',[auth.auth, validate.createOne],userAddress.createOne);
routes.put('/:id',[auth.auth, validate.updateOne], userAddress.updateOne);

// routes.post('/verify-phone', [validate.verfiyPhone],userAddress.verfiyPhone);

module.exports = routes;