'use strict';
const Op = require('sequelize').Op;
const DataHelper = require('../../../helpers/v1/data.helpers');
const error = require('../../../middleware/v1/error');
const _DataHelper = new DataHelper();

const UserSocial = require('./user_social.model');


module.exports = class UserSocialResource {
    
    async createOne(data = null) {
    
        console.log('UserSocialResource@createOne');
        if (!data || data === '') {
            throw new Error('data is required');
        }
        
        let userSocial = await UserSocial.create(data);

        if (!userSocial) {
            return false;
        }

        return userSocial;
    }


    async getOne(id){
        console.log("UserSocialResource@getOne")
        if (!id || id === '') {
            throw new Error('id is required');
        }

        let userSocial = await UserSocial.findOne({
            where: {
                id: id
            },
            //logging: console.log
        })

        if(!userSocial){
            return false;
        }


        return userSocial;
    }


    async updateOne(id, data) {
        console.log('UserSocialResource@updateOne');

        if (!id || id === '') {
            throw new Error('id is required');
        }

        try {
            await UserSocial.update(data, {
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


    async getAll(pageNo = null, limit = null, userId = null) {
        console.log('UserSocialResource@getAll');
     
        let totalRecords = await UserSocial.count();

        let pagination = await _DataHelper.pagination(totalRecords, pageNo, limit);

        if (pageNo > pagination.totalPages) {
            return {
                total: totalRecords,
                current_page: pageNo,
                total_pages: pagination.totalPages,
                per_page: pagination.limit,
                socials: [] 
            };
        }
    
        let results;
        try {
            results = await UserSocial.findAll({
                user_id: userId,
                offset: pagination.offset,
                limit: pagination.limit,
            });
            
        } catch (err) {
            console.log("err========", err);    
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }
    
        if (results.length < 1) {
            return {
                total: totalRecords,
                current_page: pageNo,
                total_pages: pagination.totalPages,
                per_page: pagination.limit,
                socials: []
            };
        }

        let resObj = {
            total: totalRecords,
            current_page: pagination.pageNo,
            total_pages: pagination.totalPages,
            per_page: pagination.limit,
            socials: results
        };
    
        return resObj;
    }

    
    async updateOrCreate(condition, data) {
        console.log("UserSocialResource@updateOrCreate");
        try {
            let isCreated = false;
            let existingSocial = await UserSocial.findOne({ where: condition });
    
            if (existingSocial) {
                await UserSocial.update(data, { where: condition });
                existingSocial = await UserSocial.findOne({ where: condition });
            } else {
                // Create new record
                existingSocial = await UserSocial.create(data);
                isCreated = true;
            }
    
            return { existingSocial, isCreated };
        } catch (err) {
            throw err;
        }
    }
    

    async getByUserId(userId) {
        console.log("UserSocialResource@getByUserId");
        if (!userId || userId === "") {
          throw new Error("id is required");
        }
    
        let userSocail = await UserSocial.findOne({
          where: {
            user_id: userId,
          },
          raw: true
        });
    
        if (!userSocail) {
          return false;
        }
    
        return userSocail;
    }


    async getByUserName(userName) {
        console.log('UserSocialResource@getByUserName');
        try {
          const results = await UserSocial.findAll({
            where: {
              theliveapp: userName
            }
          });
      
          if (!results || results.length === 0) {
            console.log(`No results found for userName: ${userName}`);
            return false;
          }
      
          return results;
        } catch (error) {
          throw error
        }

    }
      

    async deleteOne(id) {
        console.log('UserSocialResource@deleteOne');
        try {
            await UserSocial.destroy({
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
      console.log('UserSocialResource@deleteOne');
      try {
          await UserSocial.destroy({
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