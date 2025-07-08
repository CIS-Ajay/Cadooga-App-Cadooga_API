const _ = require('lodash');

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const SettingResource = require('./settings.resources');
const _Setting = new SettingResource();

module.exports = class SettingController {

    async  createOne(req, res) {
        console.log('SettingsController@createOne');
        let data = _.pick(req.body,['name', 'description', 'tearms_condition', 'privacy_policy', 'privacy', 'logo', 'user_id'])

        let setting =  await _Setting.createOne(data);
     
        if (!setting) {
            return response.notFound('not_found', res, false);
        }

        return response.created('Setting created successfully', res, setting);
    }

    async getOne(req, res) {
        console.log('SettingController@getOne');
    
        let setting = await _Setting.getOneSetting();

        if (!setting) {
            return response.notFound('not_found', res, false);
        }

        return response.success('success', res, setting);
    }

    async createLogo(req, res){
        console.log("UserProfileController@createProfile")

        if (req.file === undefined) {
            return response.badRequest('Invalid request data. Please add file to request.', res);   
        }

        return response.success('File uploaded success.', res, {
            setting_logo : process.env.APP_URL + '/'+ req.file.path,
        });
        
    }


}