'use strict';
const Op = require('sequelize').Op;
const DataHelper = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelper();

const SocialStatus = require('./social_status.model');

module.exports = class SocialStatusResource {
    
    async createOne(data = null) {
        console.log('UserProfilesResource@createOne');
        if (!data || data === '') {
            throw new Error('data is required');
        }
        
        let userProfile = await SocialStatus.create(data);

        if (!userProfile) {
            return false;
        }

        return userProfile;
    }
   

    async getOne(id){
        console.log("SocialStatusResource@getOne")
        if (!id || id === '') {
            throw new Error('id is required');
        }
        
        let user = SocialStatus.findOne({
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
        console.log("SocialStatusResource@getOne")
        if (!userId || userId === '') {
            throw new Error('id is required');
        }
        
        let user = SocialStatus.findOne({
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
            const user = await SocialStatus.findAll({
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
        console.log("SocialStatusResource@getByUserId")
        if (!id || id === '') {
            throw new Error('id is required');
        }

        let status = SocialStatus.findOne({
            where: {
                user_id: id
            }
        })

        if(!status){
            return false;
        }

        return status;
    }
    

    async updateOne(id, data) {
        console.log('SocialStatusResource@updateOne');
        try {
            await SocialStatus.update(data, {
                where: {
                    id : id
                }
            });
        } catch (err) {
            console.log(err.message)
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }

        return true;
    }


    async updateByUserId(userId, data) {
        console.log('SocialStatusResource@updateByUserId');
        try {
            await SocialStatus.update(data, {
                where: {
                    user_id : userId
                }
            });
        } catch (err) {
            console.log(err.message)
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }

        return true;
    }

    
    async updateOneByUserId(id, data) {
        console.log('UserProfilesResource@updateOneByUserId');
        try {
            await SocialStatus.update(data, {
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