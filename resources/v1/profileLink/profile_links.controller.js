const _ = require("lodash");

const ResponseHelper = require("../../../helpers/v1/response.helpers");
const response = new ResponseHelper();

const ProfileLinkResource = require("./profile_links.resources");
const _ProfileLink = new ProfileLinkResource();

const NotificationResource = require("../notifications/notifications.resources");
const _Notification = new NotificationResource();

const UserResource = require("../users/users.resources");
const _User = new UserResource();

const UserPicResource = require("../userPic/user_pics.resources");
const _UserPic = new UserPicResource();

const ApiTokenResources = require("../apiTokens/apiTokens.resources");
const _ApiToken = new ApiTokenResources();

module.exports = class ProfileLinkController {
  // async createOne(req, res) {
  //   console.log("UserProfilesController@createOne");

  //   try {
  //     let data = _.pick(req.body, ["link_date", "link_user_id"]);

  //     const userId = req.user.id;

  //     const tokenUser = await _User.getOne(userId);
  //     const linkUser = await _User.getOne(data.link_user_id);

  //     if (data.link_date) {
  //       const dateParts = data.link_date.split("-");
  //       if (dateParts.length === 3) {
  //         data.link_date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  //       } else {
  //         return response.badRequest(
  //           "Invalid date format. Please use DD-MM-YYYY.",
  //           res
  //         );
  //       }
  //     }

  //     let profileLinkData = {
  //       user_id: req.user.id,
  //       link_date: data.link_date,
  //       sender: req.user.id,
  //       receiver: data.link_user_id,
  //     };
  //     // Call the service to create the profile link
  //     let profileLink = await _ProfileLink.createOne(profileLinkData);

  //     if (!profileLink) {
  //       return response.exception(
  //         "Profile link not sent successfully",
  //         res,
  //         false
  //       );
  //     }

  //     // save notification
  //     let notificationData = {
  //       user_id: req.user.id,
  //       sender: req.user.id,
  //       receiver: data.link_user_id,
  //       link_id: profileLink.id,
  //       notification_type: "Link",
  //     };

  //     await _Notification.createOne(notificationData);

  //     return response.created(
  //       "Profile link sent successfully",
  //       res,
  //       profileLink
  //     );
  //   } catch (err) {
  //     console.error("Error in createOne:", err.message);
  //     return response.exception("Something went wrong.", res, err.message);
  //   }
  // }

  async createOne(req, res) {
    console.log("UserProfilesController@createOne");
    try {
      let data = _.pick(req.body, ["link_date", "link_user_id"]);
      const userId = req.user.id;

      // Fetch users
      const tokenUser = await _User.getOne(userId);
      const linkUser = await _User.getOne(data.link_user_id);

      if (!tokenUser || !linkUser) {
        return response.notFound("User not found.", res, false);
      }

      const tokenUserBlockedIds = tokenUser.blocked_ids
        ? JSON.parse(tokenUser.blocked_ids)
        : [];
      if (tokenUserBlockedIds.includes(data.link_user_id)) {
        return response.forbidden(
          `You cannot proceed with the connection because you have blocked this user. Please unblock the user to establish a connection.`,
          res,
          false
        );
      }

      // Check if linkUser has blocked tokenUser
      const linkUserBlockedIds = linkUser.blocked_ids
        ? JSON.parse(linkUser.blocked_ids)
        : [];
      if (linkUserBlockedIds.includes(userId)) {
        return response.forbidden(
          `You cannot proceed with the connection because your access has been restricted by them.`,
          res,
          false
        );
      }

      // Validate and reformat link_date
      if (data.link_date) {
        const dateParts = data.link_date.split("-");
        if (dateParts.length === 3) {
          data.link_date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        } else {
          return response.badRequest(
            "Invalid date format. Please use DD-MM-YYYY.",
            res,
            false
          );
        }
      }

      // Prepare profile link data
      let profileLinkData = {
        user_id: req.user.id,
        link_date: data.link_date,
        sender: req.user.id,
        receiver: data.link_user_id,
      };

      // Create profile link
      let profileLink = await _ProfileLink.createOne(profileLinkData);

      if (!profileLink) {
        return response.exception(`Failed to send a profile link`, res, false);
      }
      
      console.log("tokenUser----", tokenUser.legal_first_name, "linkUser----", linkUser.legal_first_name);
     // save notification
      let notificationData = {
        user_id: req.user.id,
        sender: req.user.id,
        receiver: data.link_user_id,
        sender_name: tokenUser.legal_first_name,
        receiver_name: linkUser.legal_first_name,
        link_id: profileLink.id,
        notification_type: "Link",
      };

      await _Notification.createOne(notificationData);

      // push notification work here
      try {
        let apiTokens = await _ApiToken.getByUserId(data.link_user_id);
        if (!apiTokens || !apiTokens.fcm_token) {
          console.warn(`No FCM token found for user ID: ${data.link_user_id}`);
        } else {
          let pushNotificationData = {
            tokens: [apiTokens.fcm_token],
            title: "New Connection Request",
            body: `${tokenUser.legal_first_name} has sent you a profile link request.`,
            sender: req.user.id,
            receiver: data.link_user_id,
            notificationType: "Link",
            notSaveInDb: true,
          };

          let check = await _Notification.sendNotificationAndSaveInDatabase(
            pushNotificationData
          );
          console.log("Push notification sent successfully:", check);
        }
      } catch (error) {
        console.error("Failed to send push notification:", error);
      }

      return response.created(
        `Profile link sent successfully`,
        res,
        profileLink
      );
    } catch (err) {
      console.error("Error in createOne:", err.message);
      return response.exception("Something went wrong.", res, err.message);
    }
  }

  // async updateOne(req, res) {
  //   console.log("ProfileLinkController@updateOne");

  //   try {
  //     const userId = req.user.id;
  //     const { status } = req.query;
  //     const linkId = req.params.id;

  //     if (!status) {
  //       return response.conflict(
  //         "Status is required in query parameters.",
  //         res,
  //         false
  //       );
  //     }

  //     const profileLink = await _ProfileLink.getOne(linkId);

  //     if (!profileLink) {
  //       return response.notFound(
  //         "Profile link not found. Please check the link ID.",
  //         res,
  //         false
  //       );
  //     }

  //     const senderId = profileLink.sender;
  //     const receiverId = profileLink.receiver;

  //     if (userId == receiverId) {
  //       const receiverUser = await _User.getOne(receiverId);
  //       const senderUser = await _User.getOne(senderId);

  //       if (!receiverUser || !senderUser) {
  //         return response.notFound("User details not found.", res, false);
  //       }

  //       // Check if the receiver has blocked the sender
  //       const receiverBlockedIds = receiverUser.blocked_ids
  //         ? JSON.parse(receiverUser.blocked_ids)
  //         : [];
  //       if (receiverBlockedIds.includes(senderId)) {
  //         return response.forbidden(
  //           "You cannot proceed with the connection because you have blocked this user. Please unblock the user to establish a connection.",
  //           res
  //         );
  //       }

  //       const senderBlockedIds = senderUser.blocked_ids
  //         ? JSON.parse(senderUser.blocked_ids)
  //         : [];
  //       if (senderBlockedIds.includes(receiverId)) {
  //         return response.forbidden(
  //           "You cannot proceed with the connection because your access has been restricted by them.",
  //           res
  //         );
  //       }
  //     }

  //     const linkData = { status };

  //     const updateLink = await _ProfileLink.updateOne(linkId, linkData);

  //     if (!updateLink) {
  //       return response.exception(
  //         "Failed to update the ProfileLink. Please try again.",
  //         res,
  //         false
  //       );
  //     }

  //     const notificationData = { status };

  //     const updateNotification = await _Notification.updateByLinkId(
  //       linkId,
  //       notificationData
  //     );

  //     if (!updateNotification) {
  //       console.warn(
  //         `Notification update failed for link ID: ${req.params.id}`
  //       );
  //     }

  //     const updatedLink = await _ProfileLink.getOne(linkId);

  //     if (!updatedLink) {
  //       return response.exception(
  //         "Failed to fetch the updated ProfileLink details.",
  //         res,
  //         false
  //       );
  //     }

  //     return response.success(
  //       "Profile link updated successfully.",
  //       res,
  //       updatedLink
  //     );
  //   } catch (error) {
  //     console.error("Error in ProfileLinkController@updateOne:", error);
  //     return response.exception(
  //       "An error occurred while updating the profile link.",
  //       res,
  //       false
  //     );
  //   }
  // }


  async updateOne(req, res) {
    console.log("ProfileLinkController@updateOne");

    try {
      const userId = req.user.id;
      const { status } = req.query;
      const linkId = req.params.id;

      if (!status) {
        return response.conflict(
          "Status is required in query parameters.",
          res,
          false
        );
      }

      const profileLink = await _ProfileLink.getOne(linkId);
       
      if (!profileLink) {
        return response.notFound(
          "Profile link not found. Please check the link ID.",
          res,
          false
        );
      }

      const senderId = profileLink.sender;
      const receiverId = profileLink.receiver;

      if (userId == receiverId) {
        const receiverUser = await _User.getOne(receiverId);
        const senderUser = await _User.getOne(senderId);

        if (!receiverUser || !senderUser) {
          return response.notFound("User details not found.", res, false);
        }

        // Check if the receiver has blocked the sender
        const receiverBlockedIds = receiverUser.blocked_ids
          ? JSON.parse(receiverUser.blocked_ids)
          : [];
        if (receiverBlockedIds.includes(senderId)) {
          return response.forbidden(
            "You cannot proceed with the connection because you have blocked this user. Please unblock the user to establish a connection.",
            res
          );
        }

        const senderBlockedIds = senderUser.blocked_ids
          ? JSON.parse(senderUser.blocked_ids)
          : [];
        if (senderBlockedIds.includes(receiverId)) {
          return response.forbidden(
            "You cannot proceed with the connection because your access has been restricted by them.",
            res
          );
        }
      }

      const linkData = { status };

      const updateLink = await _ProfileLink.updateOne(linkId, linkData);

      if (!updateLink) {
        return response.exception(
          "Failed to update the ProfileLink. Please try again.",
          res,
          false
        );
      }

      const notificationData = { status };

      const updateNotification = await _Notification.updateByLinkId(
        linkId,
        notificationData
      );

      if (!updateNotification) {
        console.warn(
          `Notification update failed for link ID: ${req.params.id}`
        );
      }

      const updatedLink = await _ProfileLink.getOne(linkId);

      if (!updatedLink) {
        return response.exception(
          "Failed to fetch the updated ProfileLink details.",
          res,
          false
        );
      }

      // Push notification work here
      try {
        let targetUserId;

        if (status === "2") {
          targetUserId = senderId;
          console.log("Notification for status 2: Sender will be notified");
        } else {
          targetUserId = status == "1" ? senderId : receiverId;
        }

        const apiTokens = await _ApiToken.getByUserId(targetUserId);
        
        if (!apiTokens || !apiTokens.fcm_token) {
          console.warn(`No FCM token found for user ID: ${targetUserId}`);
        } else {
          const pushNotificationData = {
            tokens: [apiTokens.fcm_token],
            title: status == "1" ? "Request Rejected" : "Request Accepted",
            body:
              status == "1"
                ? `${req.user.legal_first_name} has rejected your profile link request.`
                : `${req.user.legal_first_name} has accepted your profile link request.`,
            sender: userId,
            receiver: targetUserId,
            notificationType: "Link",
            notSaveInDb: true, // not save in db
          };

         await _Notification.sendNotificationAndSaveInDatabase(
            pushNotificationData
          );
        }    
      } catch (err) {
        console.error("Error sending push notification:", err);
      }
      return response.success(
        "Profile link updated successfully.",
        res,
        updatedLink
      );
    } catch (error) {
      console.error("Error in ProfileLinkController@updateOne:", error);
      return response.exception(
        "An error occurred while updating the profile link.",
        res,
        false
      );
    }
  }

  async getAll(req, res) {
    console.log("ProfileLinkController@getAll");
    try {
      let userId = req.user.id;
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;

      let profileLinks = await _ProfileLink.getAll(page, limit, userId);

      if (!profileLinks) {
        return response.notFound("Not found.", res, false);
      }

      return response.success("Successfully found.", res, profileLinks);
    } catch (error) {
      console.log("error----", error);
      throw error;
    }
  }

  // async userUnlink(req, res) {
  //   console.log("ProfileLinkController@userUnlink");

  //   try {
  //     const userId = req.user.id;
  //     const linkId = req.params.id;

  //     const linkData = { status: 3 };

  //     // Update the ProfileLink status
  //     const updateLink = await _ProfileLink.updateOne(linkId, linkData);
  //     if (!updateLink) {
  //       return response.exception(
  //         "Failed to update the ProfileLink. Please try again.",
  //         res,
  //         false
  //       );
  //     }

  //     // Fetch the existing Notification entry using linkId
  //     const existingNotification = await _Notification.getByLinkId(linkId);
  //     if (!existingNotification) {
  //       return response.exception(
  //         "No notification found for the provided link ID.",
  //         res,
  //         false
  //       );
  //     }

  //     // Prepare the notification update data
  //     const notificationData = { status: 3 };

  //     if (existingNotification.sender === userId) {
  //       const updateNotification = await _Notification.updateByLinkId(
  //         linkId,
  //         notificationData
  //       );
  //       if (!updateNotification) {
  //         console.log(`Notification update failed for link ID: ${linkId}`);
  //       }
  //     } else if (existingNotification.receiver === userId) {
  //       const updatedNotificationData = {
  //         ...notificationData,
  //         sender: existingNotification.receiver,
  //         receiver: existingNotification.sender,
  //       };
  //       await _Notification.updateByLinkId(linkId, updatedNotificationData);
  //     }

  //     const updatedLink = await _ProfileLink.getOne(linkId);
  //     if (!updatedLink) {
  //       return response.exception(
  //         "Failed to fetch the updated ProfileLink details.",
  //         res,
  //         false
  //       );
  //     }

  //     // Fetch additional sender and receiver details
  //     const senderDetails = await _User.getOne(existingNotification.sender);
  //     const receiverDetails = await _User.getOne(existingNotification.receiver);
  //     const senderPhoto = await _UserPic.getOneByUserId(
  //       existingNotification.sender
  //     );
  //     const receiverPhoto = await _UserPic.getOneByUserId(
  //       existingNotification.receiver
  //     );

  //     // Attach the additional details to the response
  //     const enhancedLink = {
  //       ...updatedLink,
  //       senderName: senderDetails?.legal_first_name || null,
  //       receiverName: receiverDetails?.legal_first_name || null,
  //       senderPhoto: senderPhoto?.photo || null,
  //       receiverPhoto: receiverPhoto?.photo || null,
  //     };

  //     return response.success(
  //       "Profile unlink and notification updated successfully.",
  //       res,
  //       enhancedLink
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async userUnlink(req, res) {
    console.log("ProfileLinkController@userUnlink");

    try {
      const userId = req.user.id;
      const linkId = req.params.id;

      const linkData = { status: 3 };

      // Update the ProfileLink status
      const updateLink = await _ProfileLink.updateOne(linkId, linkData);
      if (!updateLink) {
        return response.exception(
          "Failed to update the ProfileLink. Please try again.",
          res,
          false
        );
      }

      // Fetch the existing Notification entry using linkId
      const existingNotification = await _Notification.getByLinkId(linkId);
      if (!existingNotification) {
        return response.exception(
          "No notification found for the provided link ID.",
          res,
          false
        );
      }

      // Prepare the notification update data
      const notificationData = { status: 3 };

      if (existingNotification.sender === userId) {
        const updateNotification = await _Notification.updateByLinkId(
          linkId,
          notificationData
        );
        if (!updateNotification) {
          console.log(`Notification update failed for link ID: ${linkId}`);
        }
      } else if (existingNotification.receiver === userId) {
        const updatedNotificationData = {
          ...notificationData,
          sender: existingNotification.receiver,
          receiver: existingNotification.sender,
        };
        await _Notification.updateByLinkId(linkId, updatedNotificationData);
      }

      const updatedLink = await _ProfileLink.getOne(linkId);
      if (!updatedLink) {
        return response.exception(
          "Failed to fetch the updated ProfileLink details.",
          res,
          false
        );
      }

      // Fetch additional sender and receiver details
      const senderDetails = await _User.getOne(existingNotification.sender);
      const receiverDetails = await _User.getOne(existingNotification.receiver);
      const senderPhoto = await _UserPic.getOneByUserId(
        existingNotification.sender
      );
      const receiverPhoto = await _UserPic.getOneByUserId(
        existingNotification.receiver
      );

      // Attach the additional details to the response
      const enhancedLink = {
        ...updatedLink,
        senderName: senderDetails?.legal_first_name || null,
        receiverName: receiverDetails?.legal_first_name || null,
        senderPhoto: senderPhoto?.photo || null,
        receiverPhoto: receiverPhoto?.photo || null,
      };

      // Send Push Notification to the user who was unlinked
      try {
        const receiverId = userId === existingNotification.sender
            ? existingNotification.receiver
            : existingNotification.sender;

        const apiTokens = await _ApiToken.getByUserId(receiverId);
        if (!apiTokens || !apiTokens.fcm_token) {
          console.warn(`No FCM token found for user ID: ${receiverId}`);
        } else {
          const pushNotificationData = {
            tokens: [apiTokens.fcm_token],
            title: "Profile Unlinked",
            body: `${req.user.username} has unlinked their profile from yours.`,
            sender: userId,
            receiver: receiverId,
            notificationType: "Unlink",
            notSaveInDb: true,
          };

          await _Notification.sendNotificationAndSaveInDatabase(pushNotificationData);

        }
      } catch (error) {
        console.error("Failed to send push notification:", error);
      }

      return response.success(
        "Profile unlink and notification updated successfully.",
        res,
        enhancedLink
      );
    } catch (error) {
      throw error;
    }
  }

  
  async unlinkAll(req, res) {
    console.log("ProfileLinkController@unlinkAll");
  
    try {
      const userId = req.user.id;
  
      // Fetch all links associated with the userId
      const links = await _ProfileLink.getAllByUserId(userId);
      if (!links || links.length === 0) {
        return response.success(
          "No active links found for the provided user.",
          res,
          []
        );
      }
  
      for (const link of links) {
        const linkId = link.id;
  
        // Only update ProfileLink with status = 2
        if (link.status === 2) {
          const linkData = { status: 3 };
          await _ProfileLink.updateOne(linkId, linkData);
  
          // Fetch associated Notification by linkId
          const notification = await _Notification.getByLinkId(linkId);
  
          // Update Notification only if its status = 2
          if (notification && notification.status == 2) {
            const notificationData = { status: 3 };
            await _Notification.updateByLinkId(linkId, notificationData);
          }
        }
      }
  
      return response.success(
        "All active profiles and notifications unlinked successfully.",
        res,
        true
      );
    } catch (error) {
      console.error("Error in unlinkAll:", error);
      return response.exception(
        "An error occurred while unlinking profiles and notifications.",
        res,
        false
      );
    }
  }
  
  
  

};
