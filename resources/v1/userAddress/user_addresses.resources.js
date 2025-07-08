"use strict";
const Op = require("sequelize").Op;
const DataHelper = require("../../../helpers/v1/data.helpers");
const _DataHelper = new DataHelper();
const sequelize = require("sequelize");

const UserAddress = require("./user_address.model");

module.exports = class UserAddressResource {

  async createOne(data = null) {
    console.log("UserAddressResource@createOne");
    if (!data || data === "") {
      throw new Error("data is required");
    }

    let userAddress = await UserAddress.create(data);

    if (!userAddress) {
      return false;
    }
    return userAddress;
  }


  async getOne(id) {
    console.log("UserAddressResource@getOne");
    if (!id || id === "") {
      throw new Error("id is required");
    }

    let userPhone = await UserAddress.findOne({
      where: {
        id: id,
      },
      //logging: console.log
    });

    if (!userPhone) {
      return false;
    }

    return userPhone;
  }


  async updateOne(id, data) {
    console.log("UserAddressResource@updateOne");

    if (!id || id === "") {
      throw new Error("id is required");
    }

    try {
      await UserAddress.update(data, {
        where: {
          id: id,
        },
      });
    } catch (err) {
      throw err;
    }

    return true;
  }


  async updateOrCreate(condition, data) {
    console.log("UserAddressResource@updateOrCreate");
    try {
      let results;
      let existingLocation = await UserAddress.findOne({ where: condition });

      if (existingLocation) {
        results = await UserAddress.update(data, { where: condition });
        results = await UserAddress.findOne({ where: condition });
      } else {
        results = await UserAddress.create(data);
      }

      return results;
    } catch (err) {
      throw err;
    }
  }


  async getByUserId(userId) {
    console.log("UserAddressResource@getByUserId");
    if (!userId || userId === "") {
      throw new Error("id is required");
    }

    let userAddress = await UserAddress.findOne({
      where: {
        user_id: userId,
      },
      raw: true,
    });

    if (!userAddress) {
      return false;
    }

    return userAddress;
  }


  async deleteOne(id) {
    console.log("UserAddressResource@deleteOne");
    try {
      await UserAddress.destroy({
        where: {
          id: id,
        },
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    return true;
  }

  
  async deleteByUserId(userId, options = {}) {
    console.log("UserAddressResource@deleteOne");
    try {
      await UserAddress.destroy({
        where: { user_id: userId },
        ...options,
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    return true;
  }


  async searchByLocationRadius(lat, long, radius) {
    console.log("UserAddressResource@searchByLocationRadius");
   
    try {
        // Earth radius in kilometers
        const EARTH_RADIUS = 6371;
        const results = await UserAddress.findAll({
            where: sequelize.literal(`
                (${EARTH_RADIUS} * ACOS(
                    COS(RADIANS(${lat})) *
                    COS(RADIANS(latitude)) *
                    COS(RADIANS(longitude) - RADIANS(${long})) +
                    SIN(RADIANS(${lat})) *
                    SIN(RADIANS(latitude))
                )) <= ${radius}
            `),
            raw: true,
        });
        // return results.map((address) => ({
        //     id: address.id,
        //     user_id: address.user_id,
        //     latitude: address.latitude,
        //     longitude: address.longitude,
        //     address_name: address.address_name,
        //     formated_address: address.formated_address,
        //     city: address.city,
        //     state: address.state,
        //     zipcode: address.zipcode,
        //     country: address.country
        // }));
          return results;
    } catch (err) {
        console.error("Error in searchByLocationRadius:", err);

        const errorPayload = err.errors ? err.errors : { message: err.message };
        throw new Error(JSON.stringify(errorPayload));
    }
}


};
