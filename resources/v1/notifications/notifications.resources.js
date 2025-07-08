'use strict';
const Op = require('sequelize').Op;
const _ = require('lodash');
const sequelize = require('sequelize');
const DataHelper = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelper();
const Notification = require('./notification.model')

const FcmNotification = require('../../../helpers/v1/fcmNotification');
const _FcmNotification = new FcmNotification();

const UserResources = require('../../v1/users/users.resources');
const _User = new UserResources();

const UserPicResources = require('../../v1/userPic/user_pics.resources');
const _UserPic = new UserPicResources();

const ProfileLinkResources = require('../../v1/profileLink/profile_links.resources');
const _ProfileLink = new ProfileLinkResources();


module.exports = class NotificationResource {

    async createOne(data = null) {
        console.log('NotificationResource@createOne');
        if (!data || data === '') {
            throw new Error('data is required');
        }

        let result = await Notification.create(data);

        if (!result) {
            return false;
        }

        return result;
    }


    async getOne(id) {
        console.log("NotificationResource@getOne")
        if (!id || id === '') {
            throw new Error('id is required');
        }

        let result = await Notification.findOne({
            where: {
                id: id
            }
        })

        if (!result) {
            return false;
        }

        return result;
    }


    async updateOne(id, data) {
        console.log('NotificationResource@updateOne');
        try {
            await Notification.update(data, {
                where: {
                    id: id
                }
            });
        } catch (err) {
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }

        return true;
    }


    async updateByLinkId(id, data) {
      console.log('NotificationResource@updateByLinkId');
      try {
          await Notification.update(data, {
              where: {
                  link_id: id
              }
          });
      } catch (err) {
          Error.payload = err.errors ? err.errors : err.message;
          throw new Error();
      }

      return true;
  }


    async sendNotificationAndSaveInDatabase (notificationData = null) {
      console.log("NotificationResource@sendNotificationAndSaveInDatabase");
      const {
        tokens = [],
        topicName = null,
        title = null,
        body = null,
        senderId = null,
        receiverId = null,
        profile_id = null,
        notification_type = null,
        notSaveInDb = null,
        sent_at = null,
        type = null,
      } = notificationData;
     console.log('notificationData--------------', notificationData);
     
      try {

        if (!notSaveInDb) {
          const notificationDataToSave = {
            sender_id: senderId,
            receiver_id: receiverId,
            profile_id: profile_id,
            notification_type: notification_type,
            notification_title: title,
            notification_description: body,
            read_status: 0,
            sent_at: sent_at,
            created_at: new Date(),
          };
          await this.createOne(notificationDataToSave);
        }
         else {
          console.log("Notification not saved in database as per notSaveInDb flag.");
        }
    
        if (type === "only_save_in_db") {
          console.log("Notification data saved to database only.");
          return;
        }
    
        let sendNotification;
        if (tokens && tokens.length > 0) {
          const message = {
            notification: { title: title, body: body },
            data: {
              // profileId: String(profile_id),
              title: String(title),
              body: String(body),
              notification_type: notification_type
            },
            tokens: tokens,
          };
          console.log("message-----------------",message);
          
          // Remove null values from the data object
          Object.keys(message.data).forEach((key) => {
            if (message.data[key] === null) {
              delete message.data[key];
            } 
          });
          
          sendNotification = await _FcmNotification.sendFCMNotification(message);
          console.log("sendNotification-----------------",sendNotification);
          
        } else if (topicName) {
          const message = {
            notification: { title: title, body: body },
            data: { title: String(title), body: String(body) },
          };
          sendNotification = await _FcmNotification.sendFCMNotificationToTopic(topicName, message);
        } else {
          console.error("Tokens or topicName not provided.--------");
          return;
        }
    
        return sendNotification;
      } catch (error) {
        console.error(
          "Error occurred while sending FCM notification:------",
          error
        );
      }
    };


    async deleteOne(id) {
      console.log('NotificationResource@deleteOne');
      try {
          await Notification.destroy({
              where: {
                  id: id,
              }
          });
      } catch (err) {
          Error.payload = err.errors ? err.errors : err.message;
          throw new Error();
      }
  
      return true;
    }

    
   async deleteByUserId(userId, options = {}) {
    console.log("NotificationResource@deleteByUserId");
    try {
      await Notification.destroy({
        where: { user_id: userId },
        ...options,
      });
    } catch (err) {
      Error.payload = err.errors ? err.errors : err.message;
      throw new Error();
    }

    return true;
    }


  //   async getAll(pageNo = 1, limit = 10, userId = null, notificationType = "All") {
  //     console.log("NotificationResource@getAll");
  
  //     try {
  //         // Build the dynamic where condition
  //         let whereCondition = {
  //             receiver: userId,
  //             link_id: { [Op.ne]: null },
  //         };
  
  //         if (notificationType !== "All") {
  //             whereCondition.notification_type = notificationType;
  //         }
  
  //         // Count total records
  //         let totalRecords = await Notification.count({
  //             where: whereCondition,
  //         });
  
  //         // Calculate offset for pagination
  //         const offset = (pageNo - 1) * limit;
  //         const totalPages = Math.ceil(totalRecords / limit);
  
  //         // Ensure valid pageNo
  //         if (pageNo > totalPages) {
  //             return {
  //                 total: totalRecords,
  //                 current_page: pageNo,
  //                 total_pages: totalPages,
  //                 per_page: limit,
  //                 notifications: [],
  //             };
  //         }
  
  //         // Fetch the records
  //         let results = await Notification.findAll({
  //             where: whereCondition,
  //             order: [["updated_at", "DESC"]],
  //             offset,
  //             limit,
  //             raw: true,
  //         });
  
  //         return {
  //             total: totalRecords,
  //             current_page: pageNo,
  //             total_pages: totalPages,
  //             per_page: limit,
  //             notifications: results,
  //         };
  //     } catch (err) {
  //         console.error("Error fetching notifications:", err);
  //         throw err;
  //     }
  // }


    async getAll(pageNo, limit, userId, notificationType) {
    try {
        // Fetch notifications from the database
        let notifications = await Notification.findAll({
            raw: true,
            order: [["updated_at", "DESC"]]
        });

        if (notificationType && notificationType !== "All") {
            notifications = notifications.filter(
                (notification) => notification.notification_type === notificationType
            );
        }

        // Filter notifications based on `status`
        notifications = notifications.filter((notification) => {
            if (notification.status == 0) return notification.receiver === userId;
            if (notification.status == 1) return notification.sender === userId;
            if (notification.status == 2)
                return notification.sender === userId || notification.receiver === userId;
            if (notification.status == 3) return notification.receiver === userId;
            return false;
        });

        // Return default response if no notifications match the criteria
        if (notifications.length === 0) {
            return {
                status_code: 200,
                api_ver: "1.0.0",
                message: "No relevant notifications found.",
                data: {
                    total: 0,
                    current_page: pageNo,
                    total_pages: 0,
                    per_page: limit,
                    data: [],
                },
            };
        }

        // Calculate total pages for pagination
        const totalPages = Math.ceil(notifications.length / limit);
        
        // Handle invalid page numbers
        if (pageNo > totalPages) {
            return {
                status_code: 400,
                api_ver: "1.0.0",
                message: "Invalid page number.",
                data: {
                    total: notifications.length,
                    current_page: pageNo,
                    total_pages: totalPages,
                    per_page: limit,
                    data: [],
                },
            };
        }

        // Paginate the notifications
        const startIndex = (pageNo - 1) * limit;
        
        const paginatedNotifications = notifications.slice(startIndex, startIndex + limit);
        // Enhance notifications with additional data
        const enhancedNotifications = await Promise.all(
            paginatedNotifications.map(async (notification) => {
                // const senderDetails = await _User.getOne(notification.sender);
                // const receiverDetails = await _User.getOne(notification.receiver);
                let senderName = notification.sender_name;
                let receiverName = notification.receiver_name;
        
                try {
                    const senderDetails = await _User.getOne(notification.sender);
                    if (senderDetails) {
                        senderName = senderDetails.legal_first_name;
                    }
                } catch (err) {
                  console.warn(`Sender not found in users table for ID: ${notification.sender}`);
                }
        
                try {
                    const receiverDetails = await _User.getOne(notification.receiver);
                    if (receiverDetails) {
                        receiverName = receiverDetails.legal_first_name;
                    }
                } catch (err) {
                  console.warn(`Receiver not found in users table for ID: ${notification.receiver}`);
                }
                const senderPhoto = await _UserPic.getOneByUserId(notification.sender);
                const receiverPhoto = await _UserPic.getOneByUserId(notification.receiver);
                const profileLink = await _ProfileLink.getOne(notification.link_id);

                return {
                    ...notification,
                    // senderName: senderDetails?.legal_first_name || null,
                    // receiverName: receiverDetails?.legal_first_name || null,
                    senderName: senderName,
                    receiverName: receiverName,
                    senderPhoto: senderPhoto?.photo || null,
                    receiverPhoto: receiverPhoto?.photo || null,
                    linkDate: profileLink?.link_date || null,
                };
            })
        );

        // Return response with pagination details
        return {
            status_code: 200,
            api_ver: "1.0.0",
            message: "Successfully found.",
            data: {
                total: notifications.length,
                current_page: pageNo,
                total_pages: totalPages,
                per_page: limit,
                data: enhancedNotifications,
            },
        };
    } catch (error) {
        console.error("Error in NotificationResource.getAll:", error);
        throw new Error("An error occurred while fetching notifications.");
    }
    }

    
    async getByLinkId(linkId = null) {
      console.log("NotificationResource@getAll");

        if (!linkId || linkId === '') {
            throw new Error('id is required');
        }

        let result = await Notification.findOne({
            where: {
              link_id: linkId
            },
            raw: true
        })

        if (!result) {
            return false;
        }

        return result;
    }

}