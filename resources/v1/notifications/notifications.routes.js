const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize');
const auth = new Authorize();

const NotificationValidation = require('./notifications.validations');
const validate = new NotificationValidation();

const NotificationController = require('./notifications.controller');
const notification = new NotificationController();


/**
 * routes
 */

routes.get('/get-one',[auth.auth,validate.getOne],notification.getOne)
routes.get('/',[auth.auth, validate.getAll], notification.getAll);

// routes.post('/logo',[auth.authAdmin ,validate.createLogo], _upload.uploadFile().single('logo'), setting.createLogo)

module.exports = routes;