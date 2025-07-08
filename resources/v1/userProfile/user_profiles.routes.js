const express = require('express');
const routes = express.Router();

const RequestLogMiddleware = require('../../../middleware/v1/requestLog');
const reqLog = new RequestLogMiddleware();

const Authorize = require('../../../middleware/v1/authorize');
const auth = new Authorize();

const UserProfilesValidation = require('./user_profiles.validation');
const validate = new UserProfilesValidation();

const UserProfilesController = require('./user_profiles.controller');
const userProfile = new UserProfilesController();

const UploadUtils = require('../../../utils/upload.utils');
const _upload = new UploadUtils('uploads/users/profile')

/**
 * routes
 */

routes.post('/profile',[validate.createProfile], userProfile.createProfile)
// routes.get('/place',[auth.auth,validate.getAutoCompleteAddress],userProfile.getAutoCompleteAddress);
// routes.put('/:id',[auth.auth, validate.updateFullname],userProfile.updateFullname);
// routes.get('/place/:placeId',[auth.auth, validate.getPlaceDetails],userProfile.getPlaceDetails);
// routes.patch('/biomertic',[auth.auth, validate.updateOneBiometri], userProfile.updateOneBiometri);
// routes.put('/:id',[auth.auth, validate.updateOne, reqLog.logRequest],userProfile.updateOne);
// routes.post('/sendotp-pin',[auth.auth, validate.sendSecurityOtpPin],userProfile.sendSecurityOtpPin);
// routes.post('/verifyotp-pin',[auth.auth, validate.verifySecurityOtpPin],userProfile.verifySecurityOtpPin);
// routes.post('/change-pin',[auth.auth],userProfile.changeSecurityPin);



module.exports = routes; 