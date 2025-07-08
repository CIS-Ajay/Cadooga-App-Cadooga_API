const _ = require('lodash');

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const ZodiacResource = require('./zodiac_signs.resources');
const _Zodiac = new ZodiacResource();

const UserResources = require('../users/users.resources');
const _User = new UserResources();

module.exports = class ZodiacController {

    async createOne(req, res) {
        console.log("ZodiacController@createOne");

        let data = _.pick(req.body, ['receipt', 'platform']);
        data.user_id = req.user.id;
      
        // Create a new subscription
        let subscription = await _Zodiac.createOne(data);
      
        // If subscription creation fails, return conflict response
        if (!subscription) {
          return response.conflict("Something went wrong while saving the subscription.", res, false);
        }

        await _User.updateOne(req.user.id, { is_subscription: true });
      
        return response.success("Created successfully.", res, subscription);
      }
    

}