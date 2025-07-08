"use strict";

const DataHelper = require("../../../helpers/v1/data.helpers");
const _DataHelper = new DataHelper();

const ApiToken = require("./apiToken.model");

module.exports = class ApiTokensResource {
  async createOne(data = null) {
    console.log("ApiTokenResource@createOne");
    if (!data || data === "") {
      throw new Error("data is required");
    }

    let apiToken = await ApiToken.create(data);

    if (!apiToken) {
      return false;
    }

    return apiToken;
  }

  async generateToken(applicationId, name, type) {
    console.log("ApiTokensResource@getAll");
    let token = await _DataHelper.generateHash(
      `${applicationId}+${name}+${type}`
    );
    let data = {
      application_id: applicationId,
      token: token,
      name: name,
      type: type,
    };

    let apiToken = await ApiToken.create(data);
    return apiToken;
  }

  async findByToken(token) {
    console.log("ApiTokensResource@getAll");
    let apiToken = await ApiToken.findOne({
      where: {
        token: token,
      },
      // include: ['application'],
    });

    if (!apiToken) {
      return false;
    }

    return apiToken;
  }

  async getBydevice(device) {
    console.log("ApiTokensResource@getBydevice");
    let result = await ApiToken.findOne({
      where: {
        device_id: device,
      },
      logging: console.log,
    });

    if (!result) {
      return false;
    }

    return result;
  }

  async deleteFcmToken(userId) {
    console.log("ApiTokenResource@deleteFcmToken");
    return await ApiToken.update(
      { fcm_token: null },
      {
        where: {
          user_id: userId,
        },
      }
    );
  }

  async updateOne(userId, data) {
    console.log("ApiTokenResource@updateOne");
    try {
      await ApiToken.update(data, {
        where: {
          user_id: userId,
        },
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    return true;
  }

  async deleteOne(id) {
    console.log("ApiTokenResource@deleteOne");
    try {
      await ApiToken.destroy({
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
    console.log("ApiTokenResource@deleteByUserId");
    try {
      await ApiToken.destroy({
        where: { user_id: userId },
        ...options,
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    return true;
  }

  async getByUserId(userId) {
    console.log("ApiTokenResource@getByUserId");
    if (!userId || userId === "") {
      throw new Error("userId is required");
    }

    let result = await ApiToken.findOne({
      where: {
        user_id: userId,
      },
      raw: true
    });

    if (!result) {
      return false;
    }

    return result;
  }
};
