const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize');
const auth = new Authorize();

const UsersValidation = require('./users.validation');
const validate = new UsersValidation();

const UsersController = require('./users.controller.js');
const user = new UsersController();

const UploadUtils = require('../../../utils/upload.utils');
const _uploadUtils = new UploadUtils();


/**
 * routes
 */


routes.post('/',[validate.createOne],user.createOne); // Django
routes.post('/login/',[validate.login],user.login);
routes.post('/admin-login/',[validate.adminLogin],user.adminLogin);
routes.post('/verify-otp',[ validate.verifyOtp],user.verifyOtp); // Django
routes.post('/resend-otp',[ validate.resendOtp],user.resendOtp);
routes.get('/logout',[auth.auth,validate.logout], user.logout);
routes.post('/forget-password',[ validate.forgetPassword], user.forgetPassword);
routes.put('/',[auth.auth, validate.updateOne], user.updateOne); // Django
routes.get('/',[auth.auth,validate.getAllUser],user.getAllUser);
routes.delete('/delete-account',[auth.auth, validate.deleteAccount], user.deleteAccount);
routes.post('/change-password',[auth.auth, validate.changePassword], user.changePassword);
// routes.post('/searching',[auth.auth, validate.searchingByNameAndLocation], user.searchingByNameAndLocation);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
routes.post('/searching', [auth.auth,  validate.searchingByNameAndLocation, _uploadUtils.uploadFile().single('photo')],_uploadUtils.uploadFileAws.bind(_uploadUtils), user.searchingByNameAndLocation);
routes.get('/:id',[auth.auth,validate.getOne],user.getOne);
routes.post('/block-report',[auth.auth, validate.userBlockAndReport], user.userBlockAndReport);

// routes.post('/reset-password/',[validate.resetPassword],user.resetPassword);

module.exports = routes;