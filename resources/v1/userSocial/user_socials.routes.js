const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize');
const auth = new Authorize();

const UserSocialValidation = require('./user_socials.validation.js');
const validate = new UserSocialValidation();

const UserSocialController = require('./user_socials.controller.js');
const userSocial = new UserSocialController();

/**
 * routes
 */

routes.post('/',[auth.auth, validate.createOne],userSocial.createOne);
routes.put('/:id',[auth.auth, validate.updateOne],userSocial.updateOne);
routes.get('/:id',[auth.auth, validate.getOne],userSocial.getOne);
routes.get('/',[auth.auth, validate.getAll],userSocial.getAll);
routes.post('/validate-user-name',[auth.auth,validate.validateUserName],userSocial.validateUserName);

module.exports = routes;