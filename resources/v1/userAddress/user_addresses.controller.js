const _ = require('lodash');

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const UserAddressResource = require('./user_addresses.resources');
const _UserAddress = new UserAddressResource();

module.exports = class UserAddressController {

    async updateOne(req, res) {
        console.log("UserAddressController@updateOne");
        let data = _.pick(req.body,['address_name', 'latitude', 'longitude','formated_address', 'city', 'state', 'zipcode', 'country']);

        const userId = req.user.id;
        
        let addressData = {
            user_id: userId,
            address_name: data.address_name,
            latitude: data.latitude,
            longitude: data.longitude,
            formated_address: data.formated_address,
            city: data.city,
            state: data.state,
            zipcode: data.zipcode,
            country: data.country
        }
    
        let updateUser = await _UserAddress.updateOne(req.params.id, addressData);
    
        if (!updateUser) {
          return response.exception("Something went wrong.", res, false);
        }
        // get the updated user details
        let updatedUser = await _UserAddress.getOne(req.params.id);
    
        return response.success("Successfully updated.", res, updatedUser);
      }

}