'use strict';
const Op = require('sequelize').Op;
const _ = require('lodash');
const sequelize = require('sequelize')
const DataHelper = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelper();
const Setting = require('./setting.model')


module.exports = class SettingResource {

    async createOne(data = null) {
        console.log('SettingResource@createOne');
        if (!data || data === '') {
            throw new Error('data is required');
        }

        let result = await Setting.create(data);

        if (!result) {
            return false;
        }

        return result;
    }


    async getOne(id) {
        console.log("SettingResource@getOne")
        if (!id || id === '') {
            throw new Error('id is required');
        }

        let result = await Setting.findOne({
            where: {
                id: id
            }
        })

        if (!result) {
            return false;
        }

        return result;
    }


    async getAll() {
        console.log("SettingResource@getOne")

        let result = await Setting.findAll({})
         
        if (!result) {
            return false;
        }

        return result;
    }


    async getOneSetting() {
        console.log("SettingResource@getOne")

        let result = await Setting.findAll({

        })
        let setting = result[0];
        
        if (!setting) {
            return false;
        }

        return setting;
    }
      

    async getSetting(user_id) {
        console.log("UsersResource@getOne")
        if (!user_id || user_id === '') {
            throw new Error('user_id is required');
        }

        let result = await Setting.findOne({
            where: {
                user_id : user_id
            }
        })

        if (!result) {
            return false;
        }


        return result;
    }


    async updateOne(id, data) {
        console.log('SettingsResource@updateOne');
        try {
            await Setting.update(data, {
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


    async deleteOne(id) {
        console.log('SettingsResource@deleteOne');
        try {
            await Setting.destroy({
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
        console.log("SettingsResource@deleteByUserId");
        try {
          await Setting.destroy({
            where: { user_id: userId },
            ...options,
          });
        } catch (err) {
          Error.payload = err.errors ? err.errors : err.message;
          throw new Error();
        }
    
        return true;
    }

}