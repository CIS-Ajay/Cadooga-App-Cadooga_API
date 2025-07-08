'use strict';
const Op = require('sequelize').Op;
const DataHelper = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelper();

const Subscription = require('./subscription.model');


module.exports = class SubscriptionResource {
    
    async createOne(data = null) {
        console.log('SubscriptionResource@createOne');
        if (!data || data === '') {
            throw new Error('data is required');
        }
        
        let subscription = await Subscription.create(data);

        if (!subscription) {
            return false;
        }
        return subscription;
    }

    
    async getOne(id){
        console.log("SubscriptionResource@getOne")
        if (!id || id === '') {
            throw new Error('id is required');
        }

        let subscription = await Subscription.findOne({
            where: {
                id: id
            },
            //logging: console.log
        })

        if(!subscription){
            return false;
        }


        return subscription;
    }


    async updateOne(id, data) {
        console.log('SubscriptionResource@updateOne');

        if (!id || id === '') {
            throw new Error('id is required');
        }

        try {
            await Subscription.update(data, {
                where: {
                    id: id
                }
            });
        } catch (err) {
            throw err
        }

        return true;
    }


    async updateOrCreate(condition, data) {
        console.log('SubscriptionResource@updateOrCreate');
       try {
        let results;
        let existingLocation = await Subscription.findOne({ where: condition });
        
        if (existingLocation) {
            results = await Subscription.update(data, { where: condition });
            results = await Subscription.findOne({ where: condition });
        } else {
            results = await Subscription.create(data);
        }

        return results;
       }
       catch (err) {
        throw err
       }
       
    }


    async deleteOne(id) {
        console.log('UserAddressResource@deleteOne');
        try {
            await Subscription.destroy({
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
        console.log("UserAddressResource@deleteByUserId");
        try {
          await Subscription.destroy({
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