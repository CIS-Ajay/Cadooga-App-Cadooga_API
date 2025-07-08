"use strict";
const Op = require("sequelize").Op;
const _ = require("lodash");
const moment = require("moment");
const sequelize = require("sequelize");
const DataHelper = require("../../../helpers/v1/data.helpers");
const _DataHelper = new DataHelper();
const UserProfile = require("../userProfile/user_profile.model");
const User = require("./user.model");
const stringSimilarity = require("string-similarity");

module.exports = class UsersResource {
  async createOne(data = null) {
    console.log("UsersResource@createOne");
    if (!data || data === "") {
      throw new Error("data is required");
    }

    let user = await User.create(data);

    if (!user) {
      return false;
    }

    return user;
  }

  async createOneProfile(data = null) {
    console.log("UsersResource@createOneProfile");
    if (!data || data === "") {
      throw new Error("data is required");
    }
    let userProfile = await UserProfile.create({
      user_id: data.userId,
      fullname: data.fullname,
    });
    if (!userProfile) {
      return false;
    }
    return userProfile;
  }

  async getByEmail(email) {
    console.log("UsersResource@getByEmail");
    let result;

    try {
      result = await User.findOne({
        where: {
          email: email,
        },
        raw: true,
      });
    } catch (err) {
      console.log('err: resource', err);
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    if (!result) {
      return false;
    }

    return result;
  }

  async getOne(id) {
    console.log("UsersResource@getOne");
    if (!id || id === "") {
      throw new Error("id is required");
    }

    let result = await User.findOne({
      where: {
        id: id,
      },
      raw: true,
    });

    if (!result) {
      return false;
    }

    return result;
  }


  async getOneWithZodiacSign(id) {
    console.log("UsersResource@getOne");
    if (!id || id === "") {
      throw new Error("id is required");
    }

    let result = await User.findOne({
      where: {
        id: id,
      },
      include: [
        {
          attributes: [ "id", "name","start_date", "end_date", "traits", "image_url" ],
          association: "zodiac_sign",
        },  
      ],
      // raw: true,
    });

    if (!result) {
      return false;
    }

    return result;
  }

  async getOneDetail(id) {
    console.log("UsersResource@getOne");
    if (!id || id === "") {
      throw new Error("id is required");
    }

    let result = await User.findOne({
      where: {
        id: id,
      },
      include: [
        {
          attributes: ["fullname"],
          association: "user_profiles",
        },
      ],
    });

    if (!result) {
      return false;
    }

    return result;
  }

  async getByOtp(otp) {
    console.log("UsersResource@getByEmail");
    let results;

    try {
      results = await User.findOne({
        where: {
          email_otp: otp,
        },
        raw: true,
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    if (!results) {
      return false;
    }

    return results;
  }

  async getByPassword(password) {
    console.log("UsersResource@getByEmail");
    let results;

    try {
      results = await User.findOne({
        where: {
          password: password,
        },
        raw: true,
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    if (!results) {
      return false;
    }

    return results;
  }

  async getOneWithFullname(id) {
    console.log("UsersResource@getOne");
    if (!id || id === "") {
      throw new Error("id is required");
    }

    let result = await User.findOne({
      where: {
        id: id,
      },
      include: [
        {
          attributes: ["fullname"],
          association: "user_profiles",
        },
      ],
      logging: false,
    });

    if (!result) {
      return false;
    }

    return result;
  }

  async getEmail(id) {
    console.log("UsersResource@getOne");
    if (!id || id === "") {
      throw new Error("id is required");
    }

    let result = await User.findOne({
      where: {
        id: id,
      },
    });

    if (!result) {
      return false;
    }

    return result;
  }

  async getOneByUUID(uuid) {
    console.log("UsersResource@getOneByUUID");
    if (!uuid || uuid === "") {
      throw new Error("id is required");
    }

    try {
      let result = await User.findOne({
        where: {
          unique_uuid: uuid,
        },
        include: [
          {
            association: "user_profiles",
          },
        ],
        logging: false,
      });

      if (!result) {
        return false;
      }

      return result;
    } catch (err) {
      console.log(err);
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }
  }

  async updateOne(userId, data) {
    console.log("UsersResource@updateOne");
  
    try {
      const [affectedRows] = await User.update(data, {
        where: { id: userId },
      });
  
      if (affectedRows === 0) {
        console.warn(`No rows updated for user ID: ${userId}`);
      }
  
      return affectedRows > 0;
    } catch (err) {
      console.error("❌ Sequelize update error:", err.message);
      if (err.errors) {
        console.error("❗ Sequelize validation errors:", err.errors);
      } else {
        console.error("❗ Raw error:", err);
      }
  
      // Attach error details and throw so controller logs can catch it
      const error = new Error("Sequelize update failed");
      error.details = err.errors || err.message;
      throw error;
    }
  }
  

  async updateOneByEmail(email, data) {
    console.log("UsersResource@updateOneByEmail");
    try {
      await User.update(data, {
        where: {
          email: email,
        },
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    return true;
  }

  async updatePass(data) {
    console.log("UsersResource@updateOne");
    try {
      await User.update({
        where: {
          password: data,
        },
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    return true;
  }

  async getByPhone(phone_code, phone_no) {
    console.log("UsersResource@getByPhone");
    let results;

    try {
      results = await User.findOne({
        where: {
          phone_code: phone_code,
          phone_no: phone_no,
        },
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    if (!results) {
      return false;
    }

    return results;
  }

  async getAll(pageNo = null, limit = null, is_active = null, condition) {
    console.log("UsersResource@getAll");

    let searchCondition = {};

    // attach search condition by firstname and lastname
    if (condition.search !== "" && condition.search !== undefined) {
      searchCondition = {
        fullname: {
          [Op.like]: "%" + condition.search + "%",
        },
      };
    }
    let includesData = [
      {
        attributes: ["fullname"],
        association: "user_profiles",
        where: searchCondition,
        order: [["id", "DESC"]],
      },
    ];

    let results, totalRecords, pagination;

    if (is_active.status == "Active") {
      let activeUser = await User.findAll({
        where: {
          is_active: 1,
        },
        include: [
          {
            attributes: ["fullname"],
            association: "user_profiles",
          },
        ],
      });
      return activeUser;
    }

    if (is_active.status == "Inactive") {
      let inactiveUser = await User.findAll({
        where: {
          is_active: 0,
        },
        include: [
          {
            attributes: ["fullname"],
            association: "user_profiles",
          },
        ],
      });
      return inactiveUser;
    }

    try {
      // get a count of all the folders
      totalRecords = await User.count({
        include: includesData,
      });

      pagination = await _DataHelper.pagination(totalRecords, pageNo, limit);

      results = await User.findAll({
        include: includesData,
        offset: pagination.offset,
        limit: pagination.limit,
        order: [["id", "DESC"]],
      });
    } catch (err) {
      //console.log("Error :",err.message)
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    if (results.length < 1) {
      return false;
    }

    let resObj = {
      total: totalRecords,
      current_page: pagination.pageNo,
      total_pages: pagination.totalPages,
      per_page: pagination.limit,
      users: results,
    };

    return resObj;
  }

  async usersCount() {
    console.log("usersResource@usersCount");

    let totalRecords = await User.count({});

    if (!totalRecords) {
      return false;
    }

    return totalRecords;
  }

  async monthAndYearWiseCountUserGraphData(year) {
    console.log("usersResource@usersCount");
    try {
      let years = Number(year);
      const resultArray = [];
      for (let index = 1; index <= 12; index++) {
        resultArray.push({ month: index, Add: 0, Left: 0 });
      }
      let query = {
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn("YEAR", sequelize.col("created_at")),
              years
            ),
          ],
        },
      };
      // query = `SELECT MONTHNAME(/'created_at/'), COUNT(IF(is_active=1,1,null)) as /"active_users/", COUNT(IF(is_active=0,1,null)) as /'inactive_users/' FROM /"users/" GROUP BY(MONTHNAME(/'created_at/'))`;
      let users = await User.findAll(query);
      users.forEach((user) => {
        if (user.is_active) {
          let currentMonth = new Date(user.created_at).getMonth() + 1;
          resultArray.forEach((obj) => {
            if (obj.month === currentMonth) {
              obj.Add++;
            }
          });
        } else {
          let currentMonth = new Date(user.created_at).getMonth() + 1;
          resultArray.forEach((obj) => {
            if (obj.month === currentMonth) {
              obj.Left++;
            }
          });
        }
      });
      return resultArray;
    } catch (error) {
      console.log(error);
    }
  }

  async deactiveUserCount() {
    console.log("usersResource@usersCount");

    let totalRecords = await User.count({
      where: {
        is_active: 0,
      },
    });

    if (!totalRecords) {
      return false;
    }

    return totalRecords;
  }

  async getAllUserData(pageNo = null, limit = null) {
    console.log("UsersResource@getAll");

    let totalRecords = await User.count();

    let pagination = await _DataHelper.pagination(totalRecords, pageNo, limit);

    if (pageNo > pagination.totalPages) {
      return {
        total: totalRecords,
        current_page: pageNo,
        total_pages: pagination.totalPages,
        per_page: pagination.limit,
        users: [], // Return an empty array
      };
    }

    let results;
    try {
      results = await User.findAll({
        offset: pagination.offset,
        limit: pagination.limit,
        include: [
          {
            association: "user_address",
          },
        ],
        logging: false,
      });
    } catch (err) {
      console.log("err========", err);
    }

    if (results.length < 1) {
      return {
        total: totalRecords,
        current_page: pageNo,
        total_pages: pagination.totalPages,
        per_page: pagination.limit,
        users: [],
      };
    }

    let resObj = {
      total: totalRecords,
      current_page: pagination.pageNo,
      total_pages: pagination.totalPages,
      per_page: pagination.limit,
      users: results,
    };

    return resObj;
  }
  async deleteOne(id) {
    console.log("UserResources@deleteOne");
    try {
      const result = await User.destroy({
        where: { id },
      });
  
      if (result === 0) {
        console.warn(`User ID ${id} not found during delete.`);
      }
  
      return true;
    } catch (err) {
      const error = new Error("Failed to delete user");
      error.payload = err.errors ? err.errors : err.message;
      console.error("UserResources@deleteOne error:", error.payload);
      throw error;
    }
  }  

  async updateStatus(userid, data) {
    console.log("UsersResource@updateStatus", data);
    try {
      await User.update(data, {
        where: {
          id: userid,
        },
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    return true;
  }

  async getUserByIdAndEmail(userId, email) {
    console.log("UsersResource@getUserByIdAndEmail");
    if (!userId || userId === "" || !email || email === "") {
      throw new Error("User id and email id are required");
    }
    let result;

    try {
      result = await User.findOne({
        where: {
          id: userId,
          email: email,
        },
        raw: true,
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    if (!result) {
      return false;
    }

    return result;
  }

  async deleteByUserId(userId, options = {}) {
    console.log("UsersResource@deleteByUserId");
    try {
      await User.destroy({
        where: { id: userId },
        ...options,
      });
    } catch (err) {
      throw new Error(err.message || "Delete failed");
    }
    return true;
  }

  // async searchByName(query) {
  //   console.log("UsersResource@searchByName");
  
  //   try {
  //     const results = await User.findAll({
  //       attributes: [
  //         "id",
  //         "legal_first_name",
  //         "legal_last_name",
  //         "username",
  //         "nickname", // Added nickname
  //         "birth_day",
  //         "birth_month",
  //         "birth_year",
  //         "gender",
  //         "email",
  //       ],
  //       where: {
  //         [Op.or]: [
  //           {
  //             username: {
  //               [Op.like]: `%${query}%`,
  //             },
  //           },
  //           {
  //             nickname: {
  //               [Op.like]: `%${query}%`,
  //             },
  //           },
  //         ],
  //       },
  //       raw: true,
  //     });
      
  //     const matchedResults = results.map((user) => {
  //       // Calculate similarity for both username and nickname
  //       const usernameSimilarity = stringSimilarity.compareTwoStrings(
  //         query.toLowerCase(),
  //         user.username?.toLowerCase() || ""
  //       );
  
  //       const nicknameSimilarity = stringSimilarity.compareTwoStrings(
  //         query.toLowerCase(),
  //         user.nickname?.toLowerCase() || ""
  //       );
  
  //       const similarity = Math.max(usernameSimilarity, nicknameSimilarity);
  
  //       return {
  //         ...user,
  //         similarity: Math.round(similarity * 100),
  //       };
  //     });
  
  //     // Sort by similarity in descending order
  //     matchedResults.sort((a, b) => b.similarity - a.similarity);
  
  //     return matchedResults;
  //   } catch (err) {
  //     throw err;
  //   }
  // }
  
  async searchByName(query) {
    console.log("UsersResource@searchByName");
    // If query is not provided, return empty array
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return [];
    }
    
    try {
        const results = await User.findAll({
            attributes: [
                "id",
                "legal_first_name",
                "legal_last_name",
                "username",
                "nickname", // Added nickname
                "birth_day",
                "birth_month",
                "birth_year",
                "gender",
                "email",
            ],
            where: {
                [Op.and]: [
                    {
                        theliveapp_status: true,
                    },
                    {
                        [Op.or]: [
                            {
                                username: {
                                    [Op.like]: `%${query}%`,
                                },
                            },
                            {
                                nickname: {
                                    [Op.like]: `%${query}%`,
                                },
                            },
                        ],
                    },
                ],
            },
            raw: true,
        });

        const matchedResults = results.map((user) => {
            // Calculate similarity for both username and nickname
            const usernameSimilarity = stringSimilarity.compareTwoStrings(
                query.toLowerCase(),
                user.username?.toLowerCase() || ""
            );

            const nicknameSimilarity = stringSimilarity.compareTwoStrings(
                query.toLowerCase(),
                user.nickname?.toLowerCase() || ""
            );

            const similarity = Math.max(usernameSimilarity, nicknameSimilarity);

            return {
                ...user,
                similarity: Math.round(similarity * 100),
            };
        });

        matchedResults.sort((a, b) => b.similarity - a.similarity);

        return matchedResults;
    } catch (err) {
        throw err;
    }
}


  async searchUsersByIds(userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return [];
    }
    try {
        const results = await User.findAll({
            attributes: [
                "id",
                "legal_first_name",
                "legal_last_name",
                "username",
                "nickname",
                "birth_day",
                "birth_month",
                "birth_year",
                "gender",
                "email",
            ],
            where: {
                id: {
                    [Op.in]: userIds,
                },
                theliveapp_status: true,
            },
            raw: true,
        });

        return results;
    } catch (err) {
        throw err;
    }
  }

  async getAll() {
    return await User.findAll({
      where: {
        role: {
          [Op.in]: [0, 1],
        },
        deleted_at: null,
      },
      order: [["created_at", "DESC"]],
      raw: true,
    });
  }

  async getUserStats() {
    const [totalUsers, activeSubscriptions, closedAccounts, recentLogins] = await Promise.all([
      User.count({ where: { deleted_at: null } }),
      User.count({ where: { is_subscription: 1, deleted_at: null } }),
      User.count({ where: { deleted_at: { [Op.ne]: null } } }),
      User.count({
        where: {
          updated_at: {
            [Op.gt]: db.Sequelize.literal("NOW() - INTERVAL '24 HOURS'"),
          },
          deleted_at: null,
        },
      }),
    ]);

    return {
      totalUsers,
      activeSubscriptions,
      closedAccounts,
      recentLogins,
    };
  }

  async getUserById(id) {
    const user = await User.findOne({ where: { id } });
    if (!user) return null;
    return user;
  }

  async updateUser(id, data) {
    const updated = await User.update(data, {
      where: { id },
    });
    return updated[0] > 0;
  }

  async resetPassword(id, newPassword) {
    const updated = await User.update({
      password: newPassword,
    }, {
      where: { id },
    });
    return updated[0] > 0;
  }

  async updateSubscription(id, subscriptionType) {
    const is_subscription = subscriptionType === 'Premium' || subscriptionType === 'Paid' ? 1 : 0;
    const updated = await User.update({ is_subscription }, { where: { id } });
    return updated[0] > 0;
  }

  async updateAccountStatus(id, status) {
    let values = {};

    if (status === "banned") {
      values = { theliveapp_status: 0 };
    } else if (status === "closed") {
      values = { deleted_at: new Date() };
    } else if (status === "active") {
      values = { deleted_at: null, theliveapp_status: 1 };
    }

    const updated = await User.update(values, { where: { id } });
    return updated[0] > 0;
  }

  async clearDeviceId(userId) {
    try {
      const result = await User.update(
        {
          face_token: null,
          updated_at: new Date(),
        },
        {
          where: { id: parseInt(userId) },
          returning: false,
        }
      );
      return result[0] > 0;
    } catch (error) {
      console.error(`Error in clearDeviceId model for ID ${userId}:`, error);
      throw error;
    }
  }

  async exportUsers(filter = {}) {
    // Implement filtering logic similar to MySQL raw query version if needed
    return await User.findAll({
      where: {
        deleted_at: null,
      },
      order: [["created_at", "DESC"]],
    });
  }

};
