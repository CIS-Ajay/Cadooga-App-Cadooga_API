const _ = require("lodash");

const ResponseHelper = require("../../../helpers/v1/response.helpers");
const response = new ResponseHelper();

const UsersResource = require("../users/users.resources");
const _User = new UsersResource();

const UserPicResource = require("../userPic/user_pics.resources");
const _UserPic = new UserPicResource();

const ProfileLinkResource = require("../profileLink/profile_links.resources");
const _ProfileLink = new ProfileLinkResource();

const NotificationResource = require("./notifications.resources");
const _Notification = new NotificationResource();

module.exports = class NotificationController {
  async getOne(req, res) {
    console.log("NotificationController@getOne");

    let setting = await _Notification.getOne(req.user.id);

    if (!setting) {
      return response.notFound("not_found", res, false);
    }

    return response.success("success", res, setting);
  }
  


//   async getAll(req, res) {
//     console.log("NotificationController@getAll");
//     try {
//         let userId = req.user.id;
//         let notificationType = req.query.type;
//         let page = parseInt(req.query.page) || 1;
//         let limit = parseInt(req.query.limit) || 10;

//         let notificationsData = await _Notification.getAll(page, limit, userId, notificationType);
//         console.log("notificationsData============", notificationsData.total);
        
//         const defaultResponse = {
//             total: 0,
//             current_page: page,
//             total_pages: 0,
//             per_page: limit,
//             data: [],
//         };

//         if (!notificationsData || notificationsData.notifications.length === 0) {
//             return response.success("No notifications found.", res, defaultResponse);
//         }

//         let notifications = notificationsData.notifications;
//         console.log("notifications============", notifications);

//         // Apply notification type filter
//         if (notificationType && notificationType !== "All") {
//             notifications = notifications.filter(
//                 (notification) => notification.notification_type === notificationType
//             );
//         }

//         // If filtered notifications are empty
//         if (!notifications || notifications.length === 0) {
//             return response.success("Not found.", res, {
//                 ...defaultResponse,
//                 total: 0,
//                 total_pages: 0,
//             });
//         }

//         // Apply status filter
//         notifications = notifications.filter((notification) => {
//             if (notification.status == 0) return notification.receiver == userId;
//             if (notification.status == 1) return notification.sender == userId;
//             if (notification.status == 2) return (
//                 notification.sender == userId || notification.receiver == userId
//             );
//             if (notification.status == 3) return notification.receiver == userId;
//             return false;
//         });

//         // If status-filtered notifications are empty
//         if (notifications.length == 0) {
//             return response.success("No relevant notifications found.", res, defaultResponse);
//         }

//         // Enhance notifications
//         const enhancedNotifications = await Promise.all(
//             notifications.map(async (notification) => {
//                 const senderDetails = await _User.getOne(notification.sender);
//                 const receiverDetails = await _User.getOne(notification.receiver);
//                 const senderPhoto = await _UserPic.getOneByUserId(notification.sender);
//                 const receiverPhoto = await _UserPic.getOneByUserId(notification.receiver);
//                 const profileLink = await _ProfileLink.getOne(notification.link_id);

//                 return {
//                     ...notification,
//                     senderName: senderDetails?.legal_first_name || null,
//                     receiverName: receiverDetails?.legal_first_name || null,
//                     senderPhoto: senderPhoto?.photo || null,
//                     receiverPhoto: receiverPhoto?.photo || null,
//                     linkDate: profileLink?.link_date || null,
//                 };
//             })
//         );

//         // Return response with enhanced notifications
//         return response.success("Successfully found.", res, {
//             total: notificationsData.total,
//             current_page: page,
//             total_pages: Math.ceil(notificationsData.total / limit),
//             per_page: limit,
//             data: enhancedNotifications,
//         });
//     } catch (error) {
//         console.error("error-----", error);
//         throw error;
//     }
// }


  async  getAll(req, res) {
    try {
        const pageNo = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.user.id;
        const notificationType = req.query.type || 'All';

        const result = await _Notification.getAll(pageNo, limit, userId, notificationType);

        if (!result) {
            return response.notFound("not_found", res, false);
          }
      
        return response.success("success", res, result.data);
    } catch (error) {
        console.error("Error in getNotifications controller:", error);
    }
}


};
