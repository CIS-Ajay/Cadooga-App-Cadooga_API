const _ = require('lodash');

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const SubscriptionResource = require('./subscriptions.resources');
const _Subscription = new SubscriptionResource();

const UserResources = require('../users/users.resources');
const _User = new UserResources();

module.exports = class SubscriptionController {

    async createOne(req, res) {
        console.log("SubscriptionController@createOne");

        let data = _.pick(req.body, ['receipt', 'platform']);
        data.user_id = req.user.id;
      
        // Create a new subscription
        let subscription = await _Subscription.createOne(data);
      
        // If subscription creation fails, return conflict response
        if (!subscription) {
          return response.conflict("Something went wrong while saving the subscription.", res, false);
        }

        await _User.updateOne(req.user.id, { is_subscription: true });
      
        return response.success("Created successfully.", res, subscription);
      }
    

}