"use strict";
const Op = require("sequelize").Op;
const DataHelper = require("../../../helpers/v1/data.helpers");
const _DataHelper = new DataHelper();
const sequelize = require("sequelize");

const ProfileLink = require("./profile_link.model");

module.exports = class ProfileLinkResource {

  async createOne(data = null) {
    console.log("ProfileLinkResource@createOne");
    if (!data || data === "") {
      throw new Error("data is required");
    }

    let profileLink = await ProfileLink.create(data);

    if (!profileLink) {
      return false;
    }
    return profileLink;
  }

  async getOne(id) {
    console.log("ProfileLinkResource@getOne");

    let profileLink = await ProfileLink.findOne({
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
    console.log("ProfileLinkResource@updateOne");

    if (!id || id === "") {
      throw new Error("id is required");
    }

    try {
      await ProfileLink.update(data, {
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
    console.log("ProfileLinkResource@updateOrCreate");
    try {
      let results;
      let existingLocation = await ProfileLink.findOne({ where: condition });

      if (existingLocation) {
        results = await ProfileLink.update(data, { where: condition });
        results = await ProfileLink.findOne({ where: condition });
      } else {
        results = await ProfileLink.create(data);
      }

      return results;
    } catch (err) {
      throw err;
    }
  }

  async getByUserId(userId) {
    console.log("ProfileLinkResource@getByUserId");
    if (!userId || userId === "") {
      throw new Error("id is required");
    }

    let profileLink = await ProfileLink.findOne({
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
    console.log("ProfileLinkResource@getAllByUserId");
    if (!userId || userId === "") {
      throw new Error("id is required");
    }

    let profileLinks = await ProfileLink.findAll({
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

  async getLatestLinkByUserId(userId) {
    console.log("ProfileLinkResource@getLatestLinkByUserId");
    
    if (!userId || userId === "") {
      throw new Error("id is required");
    }

    let profileLinks = await ProfileLink.findAll({
      where: {
        [Op.or]: [
          { sender: userId },
          { receiver: userId }
        ],
        status : 2
      },
      order: [['created_at', 'DESC']],
      limit: 1,
      raw: true,
    });
  
    if (profileLinks.length === 0) {
      return false;
    }

    return [profileLinks[0]];
  }

  async getLinkByUserId(userId) {
    console.log("ProfileLinkResource@getLinkByUserId");
    
    if (!userId || userId === "") {
      throw new Error("id is required");
    }

    let profileLink = await ProfileLink.findOne({

      where: {
        [Op.or]: [
          { sender: userId },
          { receiver: userId }
        ],
        status : 2
      },
      raw: true,
    });
    
     return [profileLink]
  }

  async checkIfLinked(userId, otherUserId) {
    console.log("ProfileLinkResource@checkIfLinked");
    const linkExists = await ProfileLink.findOne({
      where: {
        [Op.or]: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId },
        ],
        status: 2,
      },
      raw: true,
    });
  
    return linkExists;
  }

  async deleteOne(id) {
    console.log("ProfileLinkResource@deleteOne");
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

  async deleteByUserId(userId, options = {}) {
    console.log("ProfileLinkResource@deleteOne");
    try {
      await ProfileLink.destroy({
        where: { user_id: userId },
        ...options,
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    return true;
  }

    async getAll(pageNo = 1, limit = 10, userId = null) {
      console.log("UserSocialResource@getAll");

      try {
      let totalRecords = await ProfileLink.count({
        where: {
          user_id: userId,
        },
      });
      
      let pagination = await _DataHelper.pagination(totalRecords, pageNo, limit);
          
      if (pageNo > pagination.totalPages) {
        return {
          total: totalRecords,
          current_page: pageNo,
          total_pages: pagination.totalPages,
          per_page: pagination.limit,
          notifications: [],
        };
      }

      let results = await ProfileLink.findAll({
        where: {
          user_id: userId,
        },
        offset: pagination.offset,
        limit: pagination.limit,
        order: [["created_at", "DESC"]],
        raw: true,
      });
    
      return {
        total: totalRecords,
        current_page: pagination.pageNo,
        total_pages: pagination.totalPages || 0,
        per_page: pagination.limit,
        records: results,
      };
    } 
    catch (err) {
      console.log("err========", err);
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }
  }

  async getUserLinkStatus(currentUserId, filteredUserId) {
    console.log("ProfileLinkResource@getUserLinkStatus");
    const profileLink = await ProfileLink.findOne({
      where: {
        [Op.or]: [
          { sender: currentUserId, receiver: filteredUserId },
          { sender: filteredUserId, receiver: currentUserId },
        ],
      },
      order: [['updated_at', 'DESC']],
    });

    if (!profileLink) {
      return -1;
    }

    return profileLink.status;
  }

  async getLinksByUsers(userId, otherUserId) {
    console.log("ProfileLinkResource@getLinksByUsers");
  
    try {
      const links = await ProfileLink.findAll({
        where: {
          [Op.and]: [
            { status: 2 },
            {
              [Op.or]: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId },
              ]
            }
          ]
        },
        raw: true
      });
      return links; // Return all matching links
    } catch (error) {
      console.error("Error in getLinksByUsers:", error);
      throw error;
    }
  }
  
};
