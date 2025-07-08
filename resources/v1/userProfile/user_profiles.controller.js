const _ = require('lodash');

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const UserProfilesResource = require('./user_profiles.resources');
const _UserProfile = new UserProfilesResource();

module.exports = class UserProfilesController {
    
    async createOne(req,res){
        console.log('UserProfilesController@createOne');

        let data = _.pick(req.body,['firstname','lastname','personal_statement','gender','dob','address','city','state','zipcode','profile_photo','mission_statement','allow_mobile_visit', 'country', 'phone_code','phone_no'])

        data.user_id = req.user.id;
        let userProfile; 

        // Check user have already profile set before
        let isProfileCheck = await _UserProfile.getByUserId(data.user_id)

        if(isProfileCheck){
            return response.exception('User profile already created before.', res, false);
        }

        // Get google address using google map api
        let location = await _Google.getAddress(data.business_address,data.city,data.country,data.business_address);
        location.state = data.state;
        location.user_id = req.user.id;

        await _UserLocation.createOne(location);

        userProfile = await _UserProfile.createOne(data);
        
        if (!userProfile) {
            return response.exception('User profile not created successfully.', res, false);
        }

        return response.created('User profile created successfully.', res, userProfile);
    }

    async getOneByUserId(req, res){
        console.log("UserProfilesController@getOneByUserId")
        let user_id = req.user.id
        let userProfile = await _UserProfile.getByUserId(user_id)

        if(!userProfile) {
            return response.notFound('User profile not found.', res, false);
        }

        return response.success('Successfully found user profile.', res, userProfile);
    }

    async createProfile(req, res){
        console.log("UserProfileController@createProfile")

        if (req.file === undefined) {
            return response.badRequest('Invalid request data, Please add file to request.', res);   
        }

        return response.success('File uploaded success.', res, {
            profile_photo : req.file.path,
        });
        
    }

    async updateOne(req, res) {
        console.log('UserProfilesController@updateOne');
        let data = _.pick(req.body,['firstname','lastname','personal_statement','gender','dob','business_address','city','state','zipcode','profile_photo','mission_statement','allow_mobile_visit', 'country', 'phone_code','phone_no'])

        let updateUserProfile = await _UserProfile.updateOne(req.params.id, data);

        if(!updateUserProfile) {
            return response.exception('Not created successfully.', res, false);
        }

        // if(data.country){
        //     let location = await _Google.getAddress(data.business_address,data.city,data.country,data.business_address);
        //     location.state = data.state;
        //     location.user_id = req.userProfile.user_id;

        //     // get user location by id
        //     let userLocation = await _UserLocation.getByUserId(location.user_id);
            
        //     if(userLocation){
        //         await _UserLocation.updateByUserId(location.user_id,location);
        //     }else{
        //         await _UserLocation.createOne(location);
        //     }
        // }

        // get the updated user profile details
        updateUserProfile = await _UserProfile.getOne(req.params.id);

        return response.success('Success', res, updateUserProfile);
    }

    async updateFullname(req, res) {
        console.log('UserProfilesController@updateOne');
        let data = _.pick(req.body,['fullname'])
     
        let updateUserProfile = await _UserProfile.updateOne(req.userProfile.user_id, data);

        if(!updateUserProfile) {
            return response.exception('Not created successfully.', res, false);
        }

        updateUserProfile = await _UserProfile.getUserId(req.params.id);

        return response.success('Success', res, updateUserProfile);
    }



}   