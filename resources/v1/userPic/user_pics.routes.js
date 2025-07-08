const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize');
const auth = new Authorize();

const UsersPicValidation = require('./user_pics.validation.js');
const validate = new UsersPicValidation();

const UsersPicController = require('./user_pics.controller.js');
const userPic = new UsersPicController();

const UploadUtils = require('../../../utils/upload.utils');
const _uploadUtils = new UploadUtils();


/**
 * routes
 */

routes.post('/',[auth.auth, validate.createOne, _uploadUtils.uploadFile().single('photo')],_uploadUtils.uploadFileAws.bind(_uploadUtils),userPic.createOne);
routes.put('/:id',[auth.auth, validate.updateOne,_uploadUtils.uploadFile().single('photo')],_uploadUtils.uploadFileAws.bind(_uploadUtils), userPic.updateOne);
routes.get('/:id',[auth.auth, validate.getOne],userPic.getOne);
routes.get('/',[auth.auth, validate.getAll],userPic.getAll);
routes.delete('/:id',[auth.auth, validate.deleteOne], userPic.deleteOne);

module.exports = routes;