const _ = require("lodash");

const ResponseHelper = require("../../../helpers/v1/response.helpers");
const response = new ResponseHelper();

const UserPicResource = require("./user_pics.resources");
const _UserPic = new UserPicResource();

const FileUploading = require("../../../utils/upload.utils");
const _upload = new FileUploading();

// const {
//   AssistantFallbackActionsPage,
// } = require("twilio/lib/rest/preview/understand/assistant/assistantFallbackActions");

// const TwilioService = require('../../../services/twillio')
// const _Twilio = new TwilioService()

module.exports = class UserPicController {
  // async createOne(req, res) {
  //   console.log("UserPicController@createOne");
  //   const userId = req.user.id;
  //   try {
  //     // let userPics = await _UserPic.getUserPhotos(userId);
  //     // if (userPics.length >= 5) {
  //     //     return response.conflict(
  //     //         "You can only upload a maximum of 5 photos.",
  //     //         res,
  //     //         false
  //     //     );
  //     // }
  //     // Extract the file key from the S3 upload data
  //     const location = req.uploadData.Location ? req.uploadData.Location : null;
  //     if (!location) {
  //       return response.conflict(
  //         "File upload failed, please try again.",
  //         res,
  //         false
  //       );
  //     }
  //     const picData = {
  //       user_id: userId,
  //       photo: location,
  //     };
  //     // Save the new photo entry to the database
  //     const createPic = await _UserPic.createOne(picData);

  //     if (!createPic) {
  //       return response.conflict(
  //         "Something went wrong while saving the photo.",
  //         res,
  //         false
  //       );
  //     }

  //     // Successfully uploaded
  //     return response.success("Photo uploaded successfully.", res, {
  //       id: createPic.id,
  //       user_id: createPic.user_id,
  //       photo: createPic.photo,
  //     });
  //   } catch (error) {
  //     console.error("Error in createOne:", error);
  //     return response.error(
  //       "An error occurred while uploading the photo.",
  //       res,
  //       error
  //     );
  //   }
  // }

  //   async updateOne(req, res) {
  //     console.log("UserController@updateOne");
  //    try {
  //     const location = req.uploadData.Location ? req.uploadData.Location : null;

  //     let picData = {
  //        photo: location
  //     }

  //     let updateUser = await _UserPic.updateOne(req.params.id, picData);

  //     if (!updateUser) {
  //       return response.exception("Something went wrong.", res, false);
  //     }
  //     // get the updated user details
  //     let updatedUser = await _UserPic.getOne(req.params.id);

  //     return response.success("Successfully updated.", res, updatedUser);
  //    } catch (error) {
  //     throw error
  //    }
  //  }

  async createOne(req, res) {
    console.log("UserPicController@createOne");
    const userId = req.user.id;
    const index = req.query.index || null;
    
    try {
      const location = req.uploadData.Location ? req.uploadData.Location : null;
      if (!location) {
        return response.conflictResp(
          "File upload failed, please try again",
          res,
          null, 
          index 
        );
      }

      const picData = {
        user_id: userId,
        photo: location,
      };

      const createPic = await _UserPic.createOne(picData);

      if (!createPic) {
        return response.conflictResp(
          "Something went wrong while saving the photo.",
          res,
          null,
          index
        );
      }

      // Success response
      return response.createdResp(
        "Photo uploaded successfully.",
        res,
        {
          id: createPic.id,
          user_id: createPic.user_id,
          photo: createPic.photo,
        },
        index
      );
    } catch (error) {
      console.error("Error in createOne:", error);
      // Error response
      return response.exception(
        "An error occurred while uploading the photo.",
        res,
        error
      );
    }
  }

  async updateOne(req, res) {
    console.log("UserPicController@updateOne");
    try {
      const index = req.query.index || null;

      const currentUser = await _UserPic.getOne(req.params.id);
      // Check if user exists
      if (!currentUser) {
        return response.notFoundResp("User not found.", res, false, index);
      }

      const location = req.uploadData.Location || null;

      let updateUser = await _UserPic.updateOne(req.params.id, {
        photo: location,
      });

      if (!updateUser) {
        return response.conflictResp(
          "Something went wrong while updating the user.",
          res,
          false,
          index
        );
      }

      const oldImageKey = currentUser.photo;
      // Delete the old image from S3 if it exists
      if (oldImageKey) {
        await _upload.deleteFileFromS3(oldImageKey);
      }
      // Get the updated user details to return
      let updatedUser = await _UserPic.getOne(req.params.id);
      
      return response.createdResp("Successfully updated.", res, updatedUser, index);
    } catch (error) {
      console.error("Error in updateOne:", error);
      return response.exception(
        "An error occurred while updating the user.",
        res,
        false
      );
    }
  }

  async getOne(req, res) {
    console.log("UserPicController@getOne");
    try {
      let userPic = await _UserPic.getOne(req.params.id);

      if (!userPic) {
        return response.exception("Something went wrong.", res, false);
      }

      return response.success("Successfully found.", res, userPic);
    } catch (error) {
      throw error;
    }
  }

  async getAll(req, res) {
    console.log("UserPicController@getAll");
    try {
      let userId = req.user.id;

      let userPics = await _UserPic.getUserPhotos(userId);

      if (!userPics) {
        return response.notFound("Not found.", res, false);
      }

      return response.success("Successfully found.", res, userPics);
    } catch (error) {
      throw error;
    }
  }


  async deleteOne(req, res) {
    console.log("UserPicController@deleteOne");

    const index = req.query.index || null;

    let getUserPic = await _UserPic.getOne(req.params.id);

    if (!getUserPic) {
      return response.notFoundResp("User Not found.", res, false, index);
    }
    if (getUserPic.photo) {
      await _upload.deleteFileFromS3(getUserPic.photo)
    }
    let deleteUser = await _UserPic.deleteOne(req.params.id);

    if (!deleteUser) {
      return response.conflictResp("Error deleting user.", res, false, index);
    }

    return response.createdResp("Successfully deleted user pic.", res, getUserPic, index);
  }


};
