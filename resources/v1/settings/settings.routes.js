const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize');
const auth = new Authorize();

const SettingValidation = require('./settings.validations');
const validate = new SettingValidation();

const SettingController = require('./settings.controller');
const setting = new SettingController();

const UploadUtils = require('../../../utils/upload.utils');
const _upload = new UploadUtils('uploads/setting/logo')

/**
 * routes
 */

routes.post('/',[auth.auth ,validate.createOne],setting.createOne)
routes.get('/get-one',[auth.auth,validate.getOne],setting.getOne)
routes.post('/logo',[auth.auth ,validate.createLogo], _upload.uploadFile().single('logo'), setting.createLogo)

module.exports = routes;