const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog.js');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize.js');
const auth = new Authorize();

const ProfileLinkValidation = require('./profile_links.validation.js');
const validate = new ProfileLinkValidation();

const UserLinkController = require('./profile_links.controller.js');
const profileLink = new UserLinkController();

/**
 * routes
 */

routes.post('/',[auth.auth, validate.createOne],profileLink.createOne);
routes.put('/:id',[auth.auth, validate.updateOne], profileLink.updateOne);
routes.get('/',[auth.auth, validate.getAll], profileLink.getAll);
routes.get('/unlink/:id',[auth.auth, validate.userUnlink], profileLink.userUnlink);
routes.get('/unlink-all/',[auth.auth, validate.unlinkAll], profileLink.unlinkAll);


module.exports = routes;