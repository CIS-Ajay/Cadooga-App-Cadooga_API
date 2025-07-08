'use strict';
const Op = require('sequelize').Op;
const DataHelper = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelper();

const UserPic = require('./user_pic.model');


module.exports = class UserPicResource {
    
    async createOne(data = null) {
    
        console.log('UserPicResource@createOne');
        if (!data || data === '') {
            throw new Error('data is required');
        }
        
        let userPic = await UserPic.create(data);

        if (!userPic) {
            return false;
        }

        return userPic;
    }


    async getOne(id){
        console.log("UserPicResource@getOne")
        if (!id || id === '') {
            throw new Error('id is required');
        }
      try {
        let userPic = await UserPic.findOne({
            where: {
                id: id
            }
        })

        if(!userPic){
            return false;
        }

        return userPic;
      } catch (error) {
        throw error
      } 
    }


    async getOneByUserId(userId){
        console.log("UserPicResource@getOneByUserId")
        if (!userId || userId === '') {
            throw new Error('userId is required');
        }

        let userPic = await UserPic.findOne({
            where: {
                user_id: userId
            }
        })

        if(!userPic){
            return false;
        }

        return userPic;
    }


    async updateOne(id, data) {
        console.log('UserPicResource@updateOne');

        if (!id || id === '') {
            throw new Error('id is required');
        }

        try {
            await UserPic.update(data, {
                where: {
                    id: id
                }
            });
        } catch (err) {
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }

        return true;
    }


    async getUserPhotos(userId) {
        console.log('UserPicResource@getUserPhotos');
        try {
            const existingPhotos = await UserPic.findAll({
                where: { user_id: userId },
            });
    
            return existingPhotos;
        } catch (error) {
            console.error("Error fetching user photos:", error);
            throw error;
        }
    }


    async deleteOne(id) {
        console.log('UserPicResource@deleteOne');
        try {
            await UserPic.destroy({
                where: {
                    id: id,
                }
            });
        } catch (err) {
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }

        return true;
    }


    async deleteByUserId(userId, options = {}) {
        console.log('UserPicResource@deleteOne');
        try {
            await UserPic.destroy({
                where: { user_id: userId },
                ...options
            });
        } catch (err) {
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }
    
        return true;
    }

}