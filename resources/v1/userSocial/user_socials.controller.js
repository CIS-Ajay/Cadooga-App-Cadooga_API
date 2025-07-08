const _ = require("lodash");

const ResponseHelper = require("../../../helpers/v1/response.helpers");
const response = new ResponseHelper();

const DataHelper = require("../../../helpers/v1/data.helpers");
const _DataHelper = new DataHelper();

const UserSocialResource = require("./user_socials.resources");
const _UserSocial = new UserSocialResource();

// const {
//   AssistantFallbackActionsPage,
// } = require("twilio/lib/rest/preview/understand/assistant/assistantFallbackActions");

// const TwilioService = require('../../../services/twillio')
// const _Twilio = new TwilioService()

module.exports = class UserSocialController {
  
  async createOne(req, res) {
    console.log("UserSocialController@createOne");

    let data = _.pick(req.body, [
      "facebook",
      "instagram",
      "x_handle",
      "tiktok",
      "snapchat",
      "theliveapp",
      "linkedin",
      "spotify",
      "pitnerest",
    ]);
    data.user_id = req.user.id;
    let userSocial = await _UserSocial.createOne(data);

    if (!userSocial) {
      return response.conflict(
        "Something went wrong while saving the Social.",
        res,
        false
      );
    }

    return response.success("Successfully created.", res, data);
  }

  async updateOne(req, res) {
    console.log("UserSocialController@updateOne");
    try {
      let data = _.pick(req.body, [
        "facebook",
        "instagram",
        "x_handle",
        "tiktok",
        "snapchat",
        "theliveapp",
        "linkedin",
        "spotify",
        "pitnerest",
      ]);
      data.user_id = req.user.id;
      let updateSocial = await _UserSocial.updateOne(req.params.id, data);

      if (!updateSocial) {
        return response.exception("Something went wrong.", res, false);
      }
      // get the updated user details
      let updatedSocial = await _UserSocial.getOne(req.params.id);

      return response.success("Successfully updated.", res, updatedSocial);
    } catch (error) {
      throw error;
    }
  }

  async getOne(req, res) {
    console.log("UserSocialController@getOne");
    try {
      let getSocial = await _UserSocial.getOne(req.params.id);

      if (!getSocial) {
        return response.exception("Something went wrong.", res, false);
      }

      return response.success("Successfully found.", res, getSocial);
    } catch (error) {
      throw error;
    }
  }

  async getAll(req, res) {
    console.log("UserSocialController@getAll");
    try {
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      let userId = req.user.id;

      let socials = await _UserSocial.getAll(page, limit, userId);

      if (!socials) {
        return response.notFound("Not found.", res, false);
      }

      return response.success("Successfully found.", res, socials);
    } catch (error) {   
      console.log("error----------------",error);
      throw error;
    }
  }

  async validateUserName(req, res) {
    console.log("UserSocialController@validateUserName");

    const { user_name } = _.pick(req.body, ["user_name"]);
    const userId = req.user.id;

    try {

      const existingUsers = await _UserSocial.getByUserName(user_name);
 
      if (existingUsers && existingUsers.length > 0) {

        const isSameUser = existingUsers.some(user => user.user_id === userId);
        
        if (isSameUser) {
          return response.success("Successfull", res, true);
        } else {

          return response.notFound("Username is already taken by another user.", res, false);
        }
      }

      return response.success("Successfull.", res, true);
  
    } catch (error) {
     throw error
    }
  }
  
  

};
