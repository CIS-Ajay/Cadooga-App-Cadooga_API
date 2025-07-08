const _ = require('lodash');

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const SocialStatusResource = require('./social_statuses.resources');
const _SocialStatus = new SocialStatusResource();

const UserResource = require('../users/users.resources');
const _User = new UserResource();

module.exports = class SocialStatusController {
    
    async createOne(req,res){
        
        console.log('SocialStatusController@createOne');

        let data = _.pick(req.body,['firstname','lastname','personal_statement','gender','dob','address','city','state','zipcode','profile_photo','mission_statement','allow_mobile_visit', 'country', 'phone_code','phone_no'])

        data.user_id = req.user.id;
        let userProfile; 

        // Check user have already profile set before
        let isProfileCheck = await _SocialStatus.getByUserId(data.user_id)

        if(isProfileCheck){
            return response.exception('User profile already created before.', res, false);
        }

        // Get google address using google map api
        let location = await _Google.getAddress(data.business_address,data.city,data.country,data.business_address);
        location.state = data.state;
        location.user_id = req.user.id;

        await _UserLocation.createOne(location);

        userProfile = await _SocialStatus.createOne(data);
        
        if (!userProfile) {
            return response.exception('User profile not created successfully.', res, false);
        }

        return response.created('User profile created successfully.', res, userProfile);
    }


    async getOneByUserId(req, res){
        console.log("SocialStatusController@getOneByUserId")
        let user_id = req.user.id
        let userProfile = await _SocialStatus.getByUserId(user_id)

        if(!userProfile) {
            return response.notFound('User profile not found.', res, false);
        }

        return response.success('Successfully found user profile.', res, userProfile);
    }


    async updateOne(req, res) {
        console.log("SocialStatusController@updateOne");
    
        // Extract the relevant fields from the request body
        let data = _.pick(req.body, [
            "snapchat_status",
            "tiktok_status",
            "instagram_status",
            "facebook_status",
            "x_handle",
            "theliveapp_status",
            "linkdin_status",
            "spotify_status",
            "pitnerest_status",
        ]);
        
        data.user_id = req.user.id;
    
        try {
            if (data.theliveapp_status) {
                let updateUser = await _User.updateOne(data.user_id, {
                    theliveapp_status: data.theliveapp_status,
                });
                if (!updateUser) {
                    return response.exception(
                        "Failed to update theliveapp_status in the user table.",
                        res,
                        false
                    );
                }
            }
    
            let socialStatus = await _SocialStatus.getByUserId(data.user_id);
    
            if (!socialStatus) {
                let createSocialStatus = await _SocialStatus.createOne(data);
    
                if (!createSocialStatus) {
                    return response.exception(
                        "Failed to create a new social status entry.",
                        res,
                        false
                    );
                }
                return response.success(
                    "New social status entry created successfully.",
                    res,
                    createSocialStatus
                );
            }
    
            // Update the social status
            let updateSocialStatus = await _SocialStatus.updateByUserId(
                data.user_id,
                data
            );
            
            if (!updateSocialStatus) {
                return response.exception(
                    "Failed to update the social status.",
                    res,
                    false
                );
            }

            let updatedStatus = await _SocialStatus.getByUserId(data.user_id);
    
            return response.success(
                "Social status updated successfully.",
                res,
                updatedStatus
            );
        } catch (error) {
            console.error("Error in SocialStatusController@updateOne:", error);
            return response.exception("Something went wrong.", res, error.message);
        }
    }
    

}   