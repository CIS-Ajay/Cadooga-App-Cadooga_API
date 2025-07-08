const _ = require("lodash");

const ResponseHelper = require("../../../helpers/v1/response.helpers");
const response = new ResponseHelper();


const SearchHistoryResources = require("./search_histories.resources");
const _SearchHistory = new SearchHistoryResources();


module.exports = class SearchHistoryController {

  async getAll(req, res) {
    console.log("SearchHistoryController@getAll");
    try {
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      let userId = req.user.id;

      let results = await _SearchHistory.getAll(page, limit, userId);

      if (!results) {
        return response.notFound("Not found.", res, false);
      }

      return response.success("Successfully found.", res, results);
    } catch (error) {
      console.log("check-----", error);
      throw error;
    }
  }


  async updateOne(req, res) {
      console.log("UserController@updateOne");
      try {
        let data = _.pick(req.body, ["is_soft_delete"]);
  
        const searchId = req.body.id;

        let searchHistory = await _SearchHistory.getOne(searchId);

        if (!searchHistory) {
          return response.notFound("Search history not found", res, false)
        }

        let updateData = {
          is_soft_delete: data.is_soft_delete
        }

        let update = await _SearchHistory.updateOne(searchId, updateData);
        if (!update) {
          return response.exception("Not updated", res, false);
        }
  
        let updatedUser = await _SearchHistory.getOne(searchId);
  
        return response.success("Successfully updated.", res, updatedUser);
      } catch (error) {
        console.error("Error in updateOne:", error);
        return response.exception("Failed to update user.", res, false);
      }
    }

};
