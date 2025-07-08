"use strict";
const Op = require("sequelize").Op;
const DataHelper = require("../../../helpers/v1/data.helpers");
const _DataHelper = new DataHelper();
const sequelize = require("sequelize");

const SearchHistory = require("./search_history.model");

module.exports = class ProfileLinkResource {

  async createOne(data = null) {
    console.log("SearchHistoryResource@createOne");
    if (!data || data === "") {
      throw new Error("data is required");
    }

    let profileLink = await SearchHistory.create(data);

    if (!profileLink) {
      return false;
    }
    return profileLink;
  }

  async getOne(id) {
    console.log("SearchHistoryResource@getOne");
    if (!id || id === "") {
      throw new Error("id is required");
    }

    let profileLink = await SearchHistory.findOne({
      where: {
        id: id,
      },
      raw: true
      //logging: console.log
    });

    if (!profileLink) {
      return false;
    }

    return profileLink;
  }

  async updateOne(id, data) {
    console.log("SearchHistoryResource@updateOne");

    if (!id || id === "") {
      throw new Error("id is required");
    }

    try {
      await SearchHistory.update(data, {
        where: {
          id: id,
        },
      });
    } catch (err) {
      throw err;
    }

    return true;
  }


  async getByUserId(userId) {
    console.log("SearchHistoryResource@getByUserId");
    if (!userId || userId === "") {
      throw new Error("id is required");
    }

    let profileLink = await SearchHistory.findOne({
      where: {
        user_id: userId,
      },
      raw: true,
    });

    if (!profileLink) {
      return false;
    }
   
    return profileLink;
  }


  async getAllByUserId(userId) {
    console.log("SearchHistoryResource@getAllByUserId");
    if (!userId || userId === "") {
      throw new Error("id is required");
    }

    let profileLinks = await SearchHistory.findAll({
      where: {
        user_id: userId,
      },
      raw: true,
    });

    if (!profileLinks.length < 0 ) {
      return false;
    }

    return profileLinks;
  }



  async deleteOne(id) {
    console.log("SearchHistoryResource@deleteOne");
    try {
      await ProfileLink.destroy({
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

  // async getAll(userId = null) {
  //   console.log("SearchHistoryResource@getAll");

  //   let results;
  //   try {
  //     results = await SearchHistory.findAll({
  //        where :{
  //         user_id: userId,
  //         is_soft_delete: 0
  //        },
  //        order: [["updated_at", "DESC"]]
  //     });
  //   } catch (err) {
  //     console.log("err========", err);
  //     Error.payload = err.errors ? err.errors : err.message;
  //     throw new Error();
  //   }

  //   if (!results || results.length === 0) {
  //     console.log(`results not found`);
  //     return false;
  //   }
  //   return results;
  // }

  async getAll( pageNo = null, limit = null, userId = null) {
    console.log("SearchHistoryResource@getAll");

    let totalRecords = await SearchHistory.count({
      where: {
        user_id: userId,
        is_soft_delete: 0,
      },
    });

    let pagination = await _DataHelper.pagination(totalRecords, pageNo, limit);
    
    if (pageNo > pagination.totalPages) {
      return {
        total: totalRecords,
        current_page: pageNo,
        total_pages: pagination.totalPages,
        per_page: pagination.limit,
        history: [],
      };
    }
  
    let results;
    try {
      results = await SearchHistory.findAll({
        where: {
          user_id: userId,
          is_soft_delete: 0,
        },
        order: [["updated_at", "DESC"]],
        offset: pagination.offset,
        limit: pagination.limit,
        logging: false,
      });
    } catch (err) {
      console.log("err========", err);
    }

    let resObj = {
      total: totalRecords,
      current_page: pagination.pageNo,
      total_pages: pagination.totalPages,
      per_page: pagination.limit,
      history: results,
    };
  
    return resObj;
  }
  


};
