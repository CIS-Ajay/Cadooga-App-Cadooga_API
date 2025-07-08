'use strict';
const Op = require('sequelize').Op;
const DataHelper = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelper();

const UserPhone = require('./user_phone.model');


module.exports = class UserPhonesResource {
    
    async createOne(data = null) {
    
        console.log('UserPhonesResource@createOne');
        if (!data || data === '') {
            throw new Error('data is required');
        }
        
        let userPhone = await UserPhone.create(data);

        if (!userPhone) {
            return false;
        }

        return userPhone;
    }


    async getOne(id){
        console.log("UserPhonesResource@getOne")
        if (!id || id === '') {
            throw new Error('id is required');
        }

        let userPhone = await UserPhone.findOne({
            where: {
                id: id
            }
        })

        if(!userPhone){
            return false;
        }


        return userPhone;
    }

    
    async updateOne(id, data) {
        console.log('UserPhonesResource@updateOne');

        if (!id || id === '') {
            throw new Error('id is required');
        }

        try {
            await UserPhone.update(data, {
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

}