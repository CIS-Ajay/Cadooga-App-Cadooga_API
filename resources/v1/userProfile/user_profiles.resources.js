'use strict';
const Op = require('sequelize').Op;
const DataHelper = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelper();

const UserProfile = require('./user_profile.model');

module.exports = class UserProfilesResource {
    
    async createOne(data = null) {
        console.log('UserProfilesResource@createOne');
        if (!data || data === '') {
            throw new Error('data is required');
        }
        
        let userProfile = await UserProfile.create(data);

        if (!userProfile) {
            return false;
        }

        return userProfile;
    }
   

    async getOne(id){
        console.log("UserProfilesResource@getOne")
        if (!id || id === '') {
            throw new Error('id is required');
        }
        
        let user = UserProfile.findOne({
            where: {
                id: id
            }
        })
        if(!user){
            return false;
        }

        return user;
    }


    async getUserId(userId){
        console.log("UserProfilesResource@getOne")
        if (!userId || userId === '') {
            throw new Error('id is required');
        }
        
        let user = UserProfile.findOne({
            where: {
                user_id: userId
            }
        })
        if(!user){
            return false;
        }

        return user;
    }


    async getFullname(userId) {
        console.log("UserProfilesResource@getOne");
        
        try {
            const user = await UserProfile.findAll({
                where: {
                    fullname: userId
                }
            });
    
            if (!user || user.length === 0) {
                return false;
            }
    
            return user;
        } catch (error) {
            console.error("Error in getFullname:", error);
            return false;
        }
    }


    async getByUserId(id){
        console.log("UserProfilesResource@getByUserId")
        if (!id || id === '') {
            throw new Error('id is required');
        }

        let user = UserProfile.findOne({
            where: {
                user_id: id
            }
        })

        if(!user){
            return false;
        }

        return user;
    }


    async getByUsersId(userIdArray){
        console.log("UserProfilesResource@getByUsersId")
        if (userIdArray.length == 0) {
            throw new Error('userIdArray is required');
        }

        let user = UserProfile.findAll({
            where: {
                user_id : {
                    [Op.in] : userIdArray
                }
            },
            attributes: ['profile_photo']

        })

        if(!user){
            return false;
        }

        return user;
    }
    

    async updateOne(id, data) {
        console.log('UserProfilesResource@updateOne');
        try {
            await UserProfile.update(data, {
                where: {
                    user_id : id
                }
            });
        } catch (err) {
            console.log(err.message)
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }

        return true;
    }


    async updateOneBiometric(id, data) {
        console.log('UserProfilesResource@updateOneBiometric');
        try {
            await UserProfile.update(data, {
                where: {
                    user_id: id
                }
            });
        } catch (err) {
            console.log(err.message)
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }

        return true;
    }


    async getByPhone(phone_code, phone_no){
        console.log('UserProfilesResource@getByPhone');
        let result;

        try {
            result = await UserProfile.findOne({
                where: {
                    phone_code: phone_code,
                    phone_no: phone_no,
                }
            });
        } catch (err) {
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }

        if(!result) {
            return false;
        }

        return result;
    }

    
    async updateOneByUserId(id, data) {
        console.log('UserProfilesResource@updateOneByUserId');
        try {
            await UserProfile.update(data, {
                where: {
                    user_id: id
                }
            });
        } catch (err) {
            console.log(err.message)
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }

        return true;
    }


}