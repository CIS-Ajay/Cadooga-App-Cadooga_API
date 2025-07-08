const _ = require("lodash");
const ResponseHelper = require("../../../helpers/v1/response.helpers");
const response = new ResponseHelper();
const moment = require('moment');
var bcrypt = require("bcryptjs");

const DataHelper = require("../../../helpers/v1/data.helpers");
const _DataHelper = new DataHelper();

const sequelize = require("../../../config/v1/mysql");

const UsersResource = require("./users.resources");
const _User = new UsersResource();

const NodeMailerService = require("../../../services/nodemailer");
const _NodeMailer = new NodeMailerService();

const ApiTokenResource = require("../apiTokens/apiTokens.resources");
const { token } = require("morgan");
const _ApiToken = new ApiTokenResource();

const AddressResource = require("../userAddress/user_addresses.resources");
const _Address = new AddressResource();

const UserPics = require("../userPic/user_pics.resources");
const _UserPics = new UserPics();

const UserSocial = require("../userSocial/user_socials.resources");
const _UserSocail = new UserSocial();

const Subscription = require("../subscription/subscriptions.resources");
const _Subscription = new Subscription();

const Setting = require("../settings/settings.resources");
const _Setting = new Setting();

const Notification = require("../notifications/notifications.resources");
const _Notification = new Notification();

const UserAddress = require("../userAddress/user_addresses.resources");
const _UserAddress = new UserAddress();

const ProfileLinkResources = require("../profileLink/profile_links.resources");
const _ProfileLink = new ProfileLinkResources();

const SearchHistoryResources = require("../searchHistory/search_histories.resources");
const _SearchHistory = new SearchHistoryResources();

const SocialStatusResources = require("../socialStatus/social_statuses.resources");
const _SocialStatus = new SocialStatusResources();

const ZodiacSignResources = require("../zodiacSign/zodiac_signs.resources");
const _ZodiacSign = new ZodiacSignResources();

const { verificationEmail } = require("../../../emailTemplates/v1/verifyemail");
const { forwardToDjango } = require("../../../services/djangoService");
const djangoEndpoints = require("../../../config/djangoEndpoints");
const { enqueueDjangoSync } = require("../../../services/enqueueDjangoSync");

module.exports = class UsersController {

  async verifyOtp(req, res) {
    console.log("UsersController@verifyOtp");
    const data = _.pick(req.body, ["email", "otp", "password"]);
  
    if (!data.otp) {
      return res.status(400).json({
        status_code: 400,
        message: "OTP is required.",
        data: {},
      });
    }
  
    try {
      const user = await _User.getByEmail(data.email);
  
      if (!user) {
        return res.status(404).json({
          status_code: 404,
          message: "User not found.",
          data: {},
        });
      }
  
      const currentDateTime = new Date();
      if (user.email_otp === data.otp && user.email_otp_expiration > currentDateTime) {
        await _User.updateOne(user.id, {
          is_email_verified: true,
          email_otp: null,
          email_otp_expiration: null,
        });
  
        const updatedUser = await _User.getOne(user.id);
  
        const djangoPayload = {
          endpoint: djangoEndpoints.AUTH.REGISTER.endpoint,
          method: djangoEndpoints.AUTH.REGISTER.method,
          data: {
            email: updatedUser.email,
            password: data.password,
            id: updatedUser.id,
            role: updatedUser.role,
            is_verified: true,
            is_email_verified: updatedUser.is_email_verified,
          },
        };
  
        try {
          await forwardToDjango(djangoPayload);
          return response.success("OTP matched successfully. Email verified.", res, {
              id: updatedUser.id,
              email: updatedUser.email,
              face_token: updatedUser.face_token,
              is_email_verified: updatedUser.is_email_verified
          });
  
          // return res.status(200).json({
          //   status_code: 200,
          //   message: "OTP matched successfully. Email verified.",
          //   data: {
          //     id: updatedUser.id,
          //     email: updatedUser.email,
          //     face_token: updatedUser.face_token,
          //     is_email_verified: updatedUser.is_email_verified
          //   }
          // });    
        } catch (err) {
          const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
          if (isRetryable) {
            await enqueueDjangoSync({
              jobIdPrefix: "sync-user",
              payload: djangoPayload
            });
  
            return res.status(200).json({
              status_code: 200,
              message: "OTP verified. Sync with Django is queued.",
              data: {
                id: updatedUser.id,
                email: updatedUser.email,
                face_token: updatedUser.face_token,
                is_verified: updatedUser.is_verified,
                is_email_verified: updatedUser.is_email_verified,
              },
            });
          }
          return res.status(err.status || 400).json({
            status_code: err.status || 400,
            message: "Invalid request",
            data: typeof err.message === 'object' ? err.message : { error: err.message },
          });
        }
      } else {
        return res.status(400).json({
          status_code: 400,
          message: "Invalid or expired OTP.",
          data: {},
        });
      }
    } catch (error) {
      console.error("Error verifying OTP", error);
      return res.status(500).json({
        status_code: 500,
        message: "An error occurred while verifying the OTP.",
        data: {},
      });
    }
  }
  
  async updateOne(req, res) {
    console.log("UserController@updateOne");
    try {
      let data = _.pick(req.body, [
        "legal_first_name",
        "legal_last_name",
        "nickname",
        "username",
        "birth_day",
        "birth_month",
        "birth_year",
        "gender",
        "face_token",
        "relationship_status",
        "sexual_identity",
        "address_name",
        "check_in_location",
        "shared_to_everyone",
        "latitude",
        "longitude",
        "fav_food",
        "fav_place",
        "about_me",
        "userAddress",
        "userSocial",
        "fcm_token",
        "zodiac_sign_id",
      ]);

      const userId = req.user.id;


      // Check and update zodiac if missing
      if (!data.zodiac_sign_id && data.birth_day && data.birth_month) {        
        const zodiacSignId = await _ZodiacSign.getZodiacSignId(data.birth_month, data.birth_day);
        if (zodiacSignId) {
          const zodiacSign = await _ZodiacSign.getOne(zodiacSignId);
          data.zodiac_signs = zodiacSign;
        }
      }
      
      let updateUser = await _User.updateOne(userId, data);
     
      
      if (!updateUser) {
        return response.exception("Something went wrong.", res, false);
      }

      // Update API token data if provided
      if ( data.fcm_token) {
        let apiTokenData = {
          fcm_token: data.fcm_token,
        };

        const existingToken = await _ApiToken.getByUserId(userId);
        if ( !existingToken || existingToken.fcm_token !== data.fcm_token) {
          await _ApiToken.updateOne(userId, apiTokenData);
        }
      }
      // Handle user address update if userAddress object is provided
      if (data.userAddress) {
        const {
          address_name,
          latitude,
          longitude,
          formated_address,
          city,
          state,
          zipcode,
          country,
          share_with,
        } = data.userAddress;

        // Check if any of the address fields are present
        if (
          address_name ||
          latitude ||
          longitude ||
          formated_address ||
          city ||
          state ||
          zipcode ||
          country ||
          share_with
        ) {
          let addressData = {
            user_id: userId,
            address_name,
            latitude,
            longitude,
            formated_address,
            city,
            state,
            zipcode,
            country,
            share_with,
          };
          // Update or create the address record
          await _Address.updateOrCreate({ user_id: userId }, addressData);
        }
      }
      // user Social work here
      if (data.userSocial) {
        const {
          facebook,
          instagram,
          x_handle,
          tiktok,
          snapchat,
          theliveapp,
          linkedin,
          spotify,
          pitnerest,
        } = data.userSocial;

        // Prepare social data
        let socialData = {
          user_id: userId,
          facebook: facebook || "", // Update with empty string if not provided
          instagram: instagram || "",
          x_handle: x_handle || "",
          tiktok: tiktok || "",
          snapchat: snapchat || "",
          theliveapp: theliveapp || "",
          linkedin: linkedin || "",
          spotify: spotify || "",
          pitnerest: pitnerest || "",
        };

        // Call updateOrCreate
        const { existingSocial, isCreated } = await _UserSocail.updateOrCreate({ user_id: userId }, socialData );
        if (isCreated) {
            await _SocialStatus.createOne({ user_id: userId });
        }
    }
      // Fetch updated user data
      let updatedUser = await _User.getOneWithZodiacSign(userId);
      const userData = updatedUser.toJSON();
      
      const address = await _Address.getByUserId(userId);
      const social = await _UserSocail.getByUserId(userId);
      const userPics = await _UserPics.getUserPhotos(userId);
      const socialStatus = await _UserSocail.getByUserId(userId);
     
      userData.userAddress = address || null;
      userData.userSocial = social || null;
      userData.userPhotos = userPics || [];
      userData.socialStatus = socialStatus || null;
      
      const allowedFields = [
        "legal_first_name", "legal_last_name", "nickname", "username",
        "fav_food", "fav_place", "about_me", "shared_to_everyone",
        "check_in_location", "birth_day", "birth_month", "birth_year",
        "gender", "face_token", "relationship_status", "sexual_identity",
        "address_name", "latitude", "longitude", "zodiac_sign_id"
      ];
      
      const requestData = { email: updatedUser.email };
      allowedFields.forEach((key) => {
        if (data[key] !== undefined) requestData[key] = data[key];
      });

      const config = djangoEndpoints.AUTH.UPDATE_PROFILE;
      console.log('config:', config);
      try {
        const djangoPayload = {
          endpoint: config.endpoint,
          method: config.method,
          ...requestData,
          headers: {
            Authorization: req.headers["authorization"],
          },
        };
      
        await forwardToDjango(djangoPayload);
        return response.success("Successfully updated.", res, {
          id: updatedUser.id,
          email: updatedUser.email,
          face_token: updatedUser.face_token,
          is_email_verified: updatedUser.is_email_verified,
        });
      
      } catch (err) {
        const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
        if (isRetryable) {
          await enqueueDjangoSync({
            jobIdPrefix: "update-user",
            payload: {
              endpoint: config.endpoint,
              method: config.method,
              ...requestData,
              headers: {
                Authorization: req.headers["authorization"],
              },
              id: updatedUser.id, // Ensure ID is present
            }
          });
      
          return response.success("Profile updated. Django sync is queued.", res, {
            id: updatedUser.id,
            email: updatedUser.email,
            face_token: updatedUser.face_token,
            is_email_verified: updatedUser.is_email_verified,
          });
        }
            
        return res.status(err.status || 500).json({
          status_code: err.status || 500,
          message: err.message || "External API Error",
          data: {},
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      return response.exception("Something went wrong.", res, false);
    }
  }
  
  async createOne(req, res) {
    console.log("UsersController@createOne");
    let data = _.pick(req.body, ["email", "password","fcm_token", "role"]);

    const encrypted_pass = await _DataHelper.hashPassword(data.password);

    const existingUser = await _User.getByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({
        status_code: 400,
        message:
          "This email already exists. Please use a different email address.",
        data: {},
      });
    }

    const otp = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP
    console.log('otp:==', otp);
    // Set OTP expiration time (e.g., 10 mins from now)
    let otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
    // Save the user object, including OTP details
    let userObj = {
      email: data.email,
      password: encrypted_pass,
      role: data.role,
      email_otp: otp, // Save the OTP
      email_otp_expiration: otpExpiration,
      is_email_verified: false,
    };
    const user = await _User.createOne(userObj);

    // Send OTP via email
    let from = process.env.SUPPORT_MAIL;
    let subject = "Verify your email address";
    const html = await verificationEmail(otp);

    let mailStatus = await _NodeMailer.sendMailNodemailer(
      from,
      data.email,
      subject,
      html
    );

    if (!mailStatus) {
      return response.exception(
        "Mail is not sent to your registered email address.",
        res,
        false
      );
    }

    const token = await _DataHelper.generateToken({ 
      id: user.id,
      email: user.email,
      user_id: user.id 
    });
    // add data in api token table
    let apiTokenObj = {
      token: token,
      fcm_token: data.fcm_token,
      user_id: user.id,
      is_active: true,
    };
    const existingToken = await _ApiToken.getByUserId(user.id);

    if (existingToken) {
      await _ApiToken.updateOne(user.id, apiTokenObj);
    } else {
      await _ApiToken.createOne(apiTokenObj);
    }

    return res.status(201).json({
      status_code: 201,
      message: "User registered. OTP sent to email.",
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        token,
        fcm_token: data.fcm_token,
        is_email_verified: user.is_email_verified,
        face_token: user.face_token,
      },
    });
  }

  async login(req, res) {
    console.log("UsersController@login");
    let user = req.user;

    let token = await _DataHelper.generateToken({
      id: user.id,
      email: user.email,
      user_id: user.id,
    });
  
    let apiTokenData = {
      token: token,
      fcm_token: req.body.fcm_token,
      user_id: user.id,
      device_id: req.headers["device-id"],
      user_agent: req.headers["user-agent"],
      is_active: 1,
    };
    console.log("api token data------------------", apiTokenData);
    const existingToken = await _ApiToken.getByUserId(user.id);
    if (existingToken) {
      await _ApiToken.updateOne(user.id, apiTokenData);
    } else {
      await _ApiToken.createOne(apiTokenData);
    }

    // Send OTP email if the user's email is not verified
    if (user.is_email_verified != true) {
      const otp = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP

      let otpExpiration = new Date();
      otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);

      let from = process.env.SUPPORT_MAIL;
      let subject = "Verify your email address";
      const html = await verificationEmail(otp);

      let mailStatus = await _NodeMailer.sendMailNodemailer(
        from,
        user.email,
        subject,
        html
      );
      if (!mailStatus) {
        return response.exception(
          "Mail is not sent to your registered email address.",
          res,
          false
        );
      }

      let userObj = {
        email_otp: otp,
        email_otp_expiration: otpExpiration,
      };
      await _User.updateOne(user.id, userObj);
    }

    const userData = await _User.getOneWithZodiacSign(user.id);
    const userJsonData = userData.toJSON();
    
    // Check and update zodiac if missing
   if (!userJsonData.zodiac_sign_id && userJsonData.birth_day && userJsonData.birth_month) {        
    const zodiacSignId = await _ZodiacSign.getZodiacSignId(userJsonData.birth_month, userJsonData.birth_day);
    if (zodiacSignId) {
      const zodiacSign = await _ZodiacSign.getOne(zodiacSignId);
      userJsonData.zodiac_sign = zodiacSign;
    }
  }
  
    const userAddress = await _Address.getByUserId(user.id);
    const userPics = await _UserPics.getUserPhotos(user.id);
    const userSocial = await _UserSocail.getByUserId(user.id);
    const socialStatus = await _SocialStatus.getByUserId(user.id);


    return response.success("Login successfully.", res, {
      id: user.id,
      email: user.email,
      token: token,
      is_email_verified: user.is_email_verified,
      legal_first_name: userJsonData.legal_first_name,
      legal_last_name: userJsonData.legal_last_name,
      nickname: userJsonData.nickname,
      birth_day: userJsonData.birth_day,
      birth_month: userJsonData.birth_month,
      birth_year: userJsonData.birth_year,
      gender: userJsonData.gender,
      relationship_status: userJsonData.relationship_status,
      sexual_identity: userJsonData.sexual_identity,
      fav_food: userJsonData.fav_food,
      about_me: userJsonData.about_me,
      fav_place: userJsonData.fav_place,
      astrology: userJsonData.astrology,
      zodiac_signs: userJsonData.zodiac_sign,
      is_verified: userJsonData.is_verified,
      blocked_ids: userJsonData.blocked_ids,
      reported_ids: userJsonData.reported_ids,
      check_in_location: userJsonData.check_in_location,
      shared_to_everyone: userJsonData.shared_to_everyone,
      is_subscription: userJsonData.is_subscription,
      face_token: userJsonData.face_token,
      userAddress: userAddress ? userAddress : null,
      userPhotos: userPics || [],
      userSocial: userSocial ? userSocial : null,
      socialStatus: socialStatus ? socialStatus: null
    });
  }

  async adminLogin(req, res) {
    console.log("UsersController@adminLogin");
    let user = req.user;
    delete user.password;
    return response.success("Admin login successfully.", res, user) 

  }

  async sendOtp(req, res) {
    console.log("UserController@sendOtp");
    let data = _.pick(req.body, ["phone_no", "phone_code", "type", "email"]);
    let otp = await _DataHelper.generateOtp();
    let sendMessage;
    try {
      if (data.type === "phone") {
        let to = data.phone_code + data.phone_no;
        await _UserPhone.createOne({
          phone_no: to,
          otp: otp,
        });

        let message = `OTP has been sent to your mobile number. Your code is ${otp}.`;
        //sendMessage = await _Twilio.sendMessage(to,message);
      }

      if (data.type === "email") {
        let from = process.env.SUPPORT_MAIL;
        let subject = "Verify your email address";

        let html = `<h3>You can use this otp to verify your email. your code is ${otp}<h3>`;
        let mailStatus = await _NodeMailer.sendMail(
          from,
          data.email,
          subject,
          html
        );

        if (mailStatus == false) {
          return response.exception(
            "mail is not sent to your register email address.",
            res,
            false
          );
        }

        await _UserEmails.createOne({
          email: data.email,
          otp: otp,
        });

        sendMessage = mailStatus;
      }

      return response.success("Message sent successfully.", res, sendMessage);
    } catch (ex) {
      return response.exception(ex.message, res, false);
    }
  }

  async resendOtp(req, res) {
    console.log("UserController@resendOtp");
    let data = _.pick(req.body, ["email"]);
    if (!data.email) {
      return res.status(400).json({
        status_code: 400,
        message: "User not found or email not provided.",
        data: {},
      });
    }
    try {
      const user = await _User.getByEmail(data.email);
      if (!user) {
        return response.notFound("Email not found.", res, false);
      }

      // Generate a new OTP
      const otp = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP
      console.log('otp: ======', otp);
      // Set OTP expiration time (e.g., 10 minutes from now)
      let otpExpiration = new Date();
      otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);

      const from = process.env.SUPPORT_MAIL;
      const subject = "Please confirm your email with cadooga";

      const html = await verificationEmail(otp);

      const mailStatus = await _NodeMailer.sendMailNodemailer(
        from,
        user.email,
        subject,
        html
      );
      // Check if the email was sent successfully
      if (!mailStatus) {
        return response.exception(
          "Failed to send OTP. Please try again later.",
          res,
          false
        );
      }
      // Update the user's OTP and expiration time in the database
      await _User.updateOne(user.id, {
        is_email_verified: false,
        email_otp: otp,
        email_otp_expiration: otpExpiration, // Set the expiration time
      });
      // Send success response
      return response.success("OTP sent successfully.", res);
    } catch (error) {
      console.error("Error resending OTP:", error);
      return res.status(500).json({
        status_code: 500,
        message: "An error occurred while resending the OTP.",
        data: {},
      });
    }
  }
  
  async forgetPassword(req, res) {
    console.log("UsersController@forgetPassword");
    let data = _.pick(req.body, ["email", "new_password"]);
    let userDetail = req.user;
    
    let token = await _DataHelper.generateToken({
      id: userDetail.id,
      email: userDetail.email,
      user_id: userDetail.id,
    });
  
    let apiTokenData = {
      token: token,
      fcm_token: req.body.fcm_token,
      user_id: userDetail.id,
      device_id: req.headers["device-id"],
      user_agent: req.headers["user-agent"],
      is_active: 1,
    };

    const existingToken = await _ApiToken.getByUserId(userDetail.id);
    if (existingToken) {
      await _ApiToken.updateOne(userDetail.id, apiTokenData);
    } else {
      await _ApiToken.createOne(apiTokenData);
    }

    const encryptedPass = await _DataHelper.hashPassword(data.new_password);

    const updatePassword = await _User.updateOne(userDetail.id, {
      password: encryptedPass,
    });

    if (!updatePassword) {
      return res.status(404).json({
        status_code: 404,
        message: "Password not updated.",
        data: {},
      });
    }

    const userData = await _User.getOneWithZodiacSign(userDetail.id);
    const userJsonData = userData.toJSON();

   // Check and update zodiac if missing
   if (!userJsonData.zodiac_sign_id && userJsonData.birth_day && userJsonData.birth_month) {        
    const zodiacSignId = await _ZodiacSign.getZodiacSignId(userJsonData.birth_month, userJsonData.birth_day);
    if (zodiacSignId) {
      const zodiacSign = await _ZodiacSign.getOne(zodiacSignId);
      userJsonData.zodiac_sign = zodiacSign;
    }
  }

    const userAddress = await _Address.getByUserId(userDetail.id);
    const userPics = await _UserPics.getUserPhotos(userDetail.id);
    const userSocial = await _UserSocail.getByUserId(userDetail.id);
    const socialStatus = await _SocialStatus.getByUserId(userDetail.id);

    

    return response.success("Password changed Successfully.", res, {
      id: userDetail.id,
      email: userDetail.email,
      token: token,
      is_email_verified: userDetail.is_email_verified,
      legal_first_name: userJsonData.legal_first_name,
      legal_last_name: userJsonData.legal_last_name,
      nickname: userJsonData.nickname,
      birth_day: userJsonData.birth_day,
      birth_month: userJsonData.birth_month,
      birth_year: userJsonData.birth_year,
      gender: userJsonData.gender,
      relationship_status: userJsonData.relationship_status,
      sexual_identity: userJsonData.sexual_identity,
      fav_food: userJsonData.fav_food,
      about_me: userJsonData.about_me,
      fav_place: userJsonData.fav_place,
      astrology: userJsonData.astrology,
      zodiac_signs: userJsonData.zodiac_sign,
      is_verified: userJsonData.is_verified,
      blocked_ids: userJsonData.blocked_ids,
      reported_ids: userJsonData.reported_ids,
      check_in_location: userJsonData.check_in_location,
      shared_to_everyone: userJsonData.shared_to_everyone,
      is_subscription: userJsonData.is_subscription,
      face_token: userJsonData.face_token,
      userAddress: userAddress ? userAddress : null,
      userPhotos: userPics || [],
      userSocial: userSocial ? userSocial : null,
      socialStatus: socialStatus ? socialStatus: null
    });
  }

  async resetPassword(req, res) {
    console.log("UsersController@restPassword");

    let data = _.pick(req.body, ["confirm_password", "password"]);
    let userDetail = req.user;
    let hashedPassword = await _DataHelper.hashPassword(data.confirm_password);
    await _User.updateOne(userDetail.id, { password: hashedPassword });

    return response.success("Password reset successfully.", res, false);
  }

  async getAllUser(req, res) {
    console.log("RelationsController@getAll");
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    let users = await _User.getAllUserData(page, limit);

    if (!users) {
      return response.notFound("Not found.", res, false);
    }

    return response.success("Successfully found.", res, users);
  }

  async deleteAccount(req, res) {
    console.log("UserController@deleteAccount");
    const userId = req.user.id;
    const transaction = await sequelize.transaction();
  
    try {
      // Retrieve the user by ID
      const user = await _User.getOne(userId);
      if (!user) {
        return res.status(404).json({
          status_code: 404,
          message: "User not found.",
          data: null,
        });
      }
  
      // Unlink all active profile links
      const links = await _ProfileLink.getAllByUserId(userId);
      
      let affectedUserIds = new Set();
      
      if (links && links.length > 0) {
        for (const link of links) {
          const linkId = link.id;
  
          if (link.status == 2) {
            const linkData = { status: 3 };
            await _ProfileLink.updateOne(linkId, linkData);
            // Save affected users to notify later
            const targetUserId = link.sender == userId ? link.receiver : link.sender;
            affectedUserIds.add(targetUserId);
       
            // Update notification status if exists
            const notification = await _Notification.getByLinkId(linkId);
            if (notification && notification.status == 2) {
              await _Notification.updateByLinkId(linkId, { status: 3 });
            }
          }
        }
      }
      
      // Send push notification to affected users
      for (let targetUserId of affectedUserIds) {
        const apiTokens = await _ApiToken.getByUserId(targetUserId);
        if (apiTokens && apiTokens.fcm_token) {
          const pushNotificationData = {
            tokens: [apiTokens.fcm_token],
            title: "Connection Removed",
            body: `${user.legal_first_name} has deleted his account, so he has been removed from Cadooga. You are no longer linked with him.`,
            sender: userId,
            receiver: targetUserId,
            notificationType: "Link",
            notSaveInDb: true,
          };
          await _Notification.sendNotificationAndSaveInDatabase(pushNotificationData);
         
        }
      }
  
      // Wrap all deletions in a try/catch so failure can rollback
      try {
        await _ApiToken.deleteByUserId(user.id, { transaction });
        await _User.deleteByUserId(user.id, { transaction });
        await _UserSocail.deleteByUserId(user.id, { transaction });
        await _Address.deleteByUserId(user.id, { transaction });
        await _Subscription.deleteByUserId(user.id, { transaction });
        await _Setting.deleteByUserId(user.id, { transaction });

        await transaction.commit();
      } catch (deleteError) {
        await transaction.rollback();
        console.error("Failed to delete user data:", deleteError);
        return res.status(500).json({
          status_code: 500,
          message: "Failed to delete user data.",
          data: {},
        });
      }

      // Sync with Django
      const djangoPayload = {
        endpoint: djangoEndpoints.AUTH.DELETE_ACCOUNT.endpoint,
        method: djangoEndpoints.AUTH.DELETE_ACCOUNT.method,
        data: {
        id: user.id,
        email: user.email,
        },
        headers: {
          Authorization: req.headers["authorization"],
        },
      };

      try {
        await forwardToDjango(djangoPayload);
      } catch (err) {
        const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
        console.log('isRetryable:', isRetryable);
        if (isRetryable) {
          await enqueueDjangoSync({
            jobIdPrefix: "delete-user",
            payload: djangoPayload,
          });
        } else {
          console.warn("Django delete failed:", err.message);
        }
      }
  
      return res.status(200).json({
        status_code: 200,
        message: "Account deleted successfully.",
        data: null,
      });
      } catch (error) {
        await transaction.rollback();
        console.error("Error deleting account:", error);
        return res.status(400).json({
          status_code: 400,
          message: "Something went wrong.",
          data: error,
        });
    }
  }


  //OLD RIGHT FUNCTION
  async getOne(req, res) {
    console.log("UsersController@getOne");
    const userId = req.params.id;
    const { other_user_id } = req.query;
    const tokenId = req.user.id;
    try {
      // Fetch user details, address, pictures, and social info in parallel
      const userData = await _User.getOneWithZodiacSign(userId);
      const userAddress = await _Address.getByUserId(userId);
      const userPics = await _UserPics.getUserPhotos(userId);
      const userSocial = await _UserSocail.getByUserId(userId);
      const socialStatus = await _SocialStatus.getByUserId(userId);

      const userJsonData = userData.toJSON();

      if (!userJsonData) {
        return response.notFound("User not found.", res, false);
      }
     
      // Check and update zodiac if missing
      if (!userJsonData.zodiac_sign_id && userJsonData.birth_day && userJsonData.birth_month) {        
        const zodiacSignId = await _ZodiacSign.getZodiacSignId(userJsonData.birth_month, userJsonData.birth_day);
        if (zodiacSignId) {
          const zodiacSign = await _ZodiacSign.getOne(zodiacSignId);
          userJsonData.zodiac_sign = zodiacSign;
        }
      }

      let profileLinksData = null;
      let blockedByMe = false;
      let blockedByOther = false;
      let reportedByMe = false;
  
      if (userId !== tokenId) {
        // Fetch blocking data only if userId and tokenId are different
        const tokenUser = await _User.getOne(tokenId);
        const paramUser = await _User.getOne(userId);
  
        if (tokenUser && paramUser) {
          const tokenBlockedIds = tokenUser.blocked_ids ? JSON.parse(tokenUser.blocked_ids) : [];
          const paramBlockedIds = paramUser.blocked_ids ? JSON.parse(paramUser.blocked_ids) : [];
          const tokenReportedIds = tokenUser.reported_ids ? JSON.parse(tokenUser.reported_ids) : [];

          if (tokenBlockedIds.includes(parseInt(userId))) {
            blockedByMe = true;
          }
  
          if (paramBlockedIds.includes(parseInt(tokenId))) {
            blockedByOther = true;
          }

          if (tokenReportedIds.includes(parseInt(userId))) {
            reportedByMe = true;
          }
        }
      }
  
      if (other_user_id && userId !== other_user_id) {
        const linkedData = await _ProfileLink.checkIfLinked(userId, other_user_id);
        if (linkedData) {
          profileLinksData = [linkedData];
        } else {
          profileLinksData = await _ProfileLink.getLatestLinkByUserId(userId);
        }
      } else {
        // Either other_user_id is same or not provided
        profileLinksData = await _ProfileLink.getLatestLinkByUserId(userId);
      }
      
      if (profileLinksData) {
        profileLinksData = await Promise.all(
          profileLinksData.map(async (link) => {
            const senderDetails = await _User.getOne(link.sender);
            const receiverDetails = await _User.getOne(link.receiver);
            const senderPhoto = await _UserPics.getOneByUserId(link.sender);
            const receiverPhoto = await _UserPics.getOneByUserId(link.receiver);
            return {
              ...link,
              senderName: senderDetails?.legal_first_name || null,
              receiverName: receiverDetails?.legal_first_name || null,
              senderPhoto: senderPhoto ? senderPhoto.photo : null,
              receiverPhoto: receiverPhoto ? receiverPhoto.photo : null,
            };
          })
        );
      }
      
  
      const userResponse = {
        ...userJsonData,
        userAddress: userAddress ? userAddress : null,
        userPhotos: userPics ? userPics : [],
        userSocial: userSocial ? userSocial : null,
        profileLinks: profileLinksData ? profileLinksData: [],
        socialStatus: socialStatus? socialStatus: null,
        blocked_by_me: blockedByMe,
        blocked_by_other: blockedByOther,
        reported_by_me: reportedByMe
      };
  
      return response.success("User successfully found.", res, userResponse);
    } catch (err) {
      console.error("Error fetching user data:", err);
      return response.error(
        "An error occurred while fetching user data.",
        res,
        false
      );
    }
  }
      
  async deleteOne(req, res) {
    console.log("UsersController@deleteOne");
    let deleteUser = await _User.deleteOne(req.params.id);

    if (!deleteUser) {
      return response.exception("Error deleting user.", res, false);
    }

    return response.success("Successfully deleted user.", res, false);
  }

  async logout(req, res) {
    console.log("UsersController@logout");
    let userId = req.user.id;
    await _User.updateOne(userId, {check_in_location: null, shared_to_everyone: 0 }),
    await _ApiToken.deleteFcmToken(userId);
    return response.success("Logout successfully.", res, false);
  }

  async updateStatus(req, res) {
    console.log("UserController@updateStatus");

    let data = {};
    if (req.user.is_active === false) {
      data.is_active = true;
    } else {
      data.is_active = false;
    }

    let updateUser = await _User.updateStatus(req.params.id, data);

    if (!updateUser) {
      return response.exception("Something went wrong.", res, false);
    }

    // get the updated user details
    let user = await _User.getOne(req.params.id);

    return response.success("Successfully updated.", res, user);
  }

  //old right function
  // async deleteAccount(req, res) {
  //   console.log("UserController@deleteAccount");
  //   const userId = req.user.id;
  //   const transaction = await sequelize.transaction();

  //   try {
  //     // Retrieve the user by ID
  //     const user = await _User.getOne(userId);

  //     if (!user) {
  //       await transaction.rollback();
  //       return res.status(404).json({
  //         status_code: 404,
  //         message: "User not found.",
  //         data: null,
  //       });
  //     }

  //     await _User.deleteByUserId(user.id, { transaction });
  //     await _UserSocail.deleteByUserId(user.id, { transaction });
  //     await _UserPics.deleteByUserId(user.id, { transaction });
  //     await _Address.deleteByUserId(user.id, { transaction });
  //     await _Subscription.deleteByUserId(user.id, { transaction });
  //     await _Setting.deleteByUserId(user.id, { transaction });
  //     await _Notification.deleteByUserId(user.id, { transaction });
  //     await _ApiToken.deleteByUserId(user.id, { transaction });

  //     await transaction.commit();

  //     return res.status(200).json({
  //       status_code: 200,
  //       message: "Account deleted successfully.",
  //       data: null,
  //     });
  //   } catch (error) {
  //     await transaction.rollback();
  //     console.error("Error deleting account:", error);
  //     return res.status(400).json({
  //       status_code: 400,
  //       message: "Something went wrong.",
  //       data: error,
  //     });
  //   }
  // }


  // async userBlockAndReport(req, res) {
  //   console.log("UsersController@userBlockAndReport");
  
  //   const { blockedId, reportId, flag = 0 } = req.body || {};
  //   const userId = req.user.id;
  
  //   if (!blockedId && !reportId) {
  //     return response.badRequest(
  //       "At least one of 'blockedId' or 'reportId' parameters is required.",
  //       res,
  //       false
  //     );
  //   }
  
  //   try {
  //     let user = await _User.getOne(userId);
  //     if (!user) {
  //       return response.notFound("User not found.", res, false);
  //     }
  
  //     const data = {};
  //     let actionMessage = "";
  
  //     if (blockedId) {
  //       let existingBlockedIds = user.blocked_ids ? JSON.parse(user.blocked_ids) : [];
  
  //       if (flag === 1) {
  //         existingBlockedIds = existingBlockedIds.filter(id => id !== blockedId);
  //         actionMessage = "User unblocked successfully.";
  //       } else {
  //         existingBlockedIds = Array.from(new Set([...existingBlockedIds, blockedId]));
  //         actionMessage = "User blocked successfully.";
  //       }
  
  //       data.blocked_ids = JSON.stringify(existingBlockedIds);
  //     }
  
  //     if (reportId) {
  //       let existingReportedIds = user.reported_ids
  //         ? JSON.parse(user.reported_ids)
  //         : [];
  
  //       if (flag === 1) {
  //         existingReportedIds = existingReportedIds.filter(id => id !== reportId);
  //         actionMessage = "User unreported successfully.";
  //       } else {
  //         existingReportedIds = Array.from(new Set([...existingReportedIds, reportId]));
  //         actionMessage = "User reported successfully.";
  //       }
  
  //       data.reported_ids = JSON.stringify(existingReportedIds);
  //     }
  
  //     let update = await _User.updateOne(user.id, data);
  //     if (!update) {
  //       return response.conflict("Failed to update user data.", res, false);
  //     }
  
  //     let updatedUser = await _User.getOne(userId);
  
  //     return response.success(actionMessage, res, updatedUser);
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // }


  async userBlockAndReport(req, res) {
    console.log("UsersController@userBlockAndReport");
  
    const { blockedId, reportId, flag = 0 } = req.body || {};
    const userId = req.user.id;
  
    if (!blockedId && !reportId) {
      return response.badRequest(
        "At least one of 'blockedId' or 'reportId' parameters is required.",
        res,
        false
      );
    }
  
    try {
      let user = await _User.getOne(userId);
      if (!user) {
        return response.notFound("User not found.", res, false);
      }
  
      const data = {};
      let actionMessage = "";
  
      // Handle Blocking Logic
      if (blockedId) {
        let existingBlockedIds = user.blocked_ids ? JSON.parse(user.blocked_ids) : [];
  
        if (flag == 1) {
          // Unblock User
          existingBlockedIds = existingBlockedIds.filter(id => id !== blockedId);
          actionMessage = "User unblocked successfully.";
        } else {
          // Block User
          existingBlockedIds = Array.from(new Set([...existingBlockedIds, blockedId]));
          actionMessage = "User blocked successfully.";
  
          // Unlink Profiles if Blocking
          const links = await _ProfileLink.getLinksByUsers(userId, blockedId);
          
          if (links && links.length > 0) {
            for (const link of links) {
              const linkData = { status: 3 }; // Status for unlink
              const updateLink = await _ProfileLink.updateOne(link.id, linkData);
  
              if (updateLink) {
                console.log(`ProfileLink unlinked successfully for users: ${userId} and ${blockedId}`);
  
                // Update Notifications
                const existingNotification = await _Notification.getByLinkId(link.id);
                if (existingNotification) {
                  const notificationData = { status: 3 };
                  if (existingNotification.sender == userId) {
                    await _Notification.updateByLinkId(link.id, notificationData);
                  } else if (existingNotification.receiver == userId) {
                    const updatedNotificationData = {
                      ...notificationData,
                      sender: existingNotification.receiver,
                      receiver: existingNotification.sender,
                    };
                    await _Notification.updateByLinkId(link.id, updatedNotificationData);
                  }
                }
  
                // Send Push Notifications for Unlinking
                try {
                  const receiverId =
                    userId == existingNotification?.sender
                      ? existingNotification.receiver
                      : existingNotification.sender;
  
                  const apiTokens = await _ApiToken.getByUserId(receiverId);
                  if (apiTokens && apiTokens.fcm_token) {
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
                    console.log("Push notification sent for unlinking.");
                  } else {
                    console.warn(`No FCM token found for user ID: ${receiverId}`);
                  }
                } catch (error) {
                  console.error("Failed to send push notification for unlinking:", error);
                }
              }
            }
          }
        }
  
        data.blocked_ids = JSON.stringify(existingBlockedIds);
      }
  
      // Handle Reporting Logic
      if (reportId) {
        let existingReportedIds = user.reported_ids
          ? JSON.parse(user.reported_ids)
          : [];
  
        if (flag === 1) {
          // Unreport User
          existingReportedIds = existingReportedIds.filter(id => id !== reportId);
          actionMessage = "User unreported successfully.";
        } else {
          // Report User
          existingReportedIds = Array.from(new Set([...existingReportedIds, reportId]));
          actionMessage = "User reported successfully.";
        }
  
        data.reported_ids = JSON.stringify(existingReportedIds);
      }
  
      // Update User Data
      let update = await _User.updateOne(user.id, data);
      if (!update) {
        return response.conflict("Failed to update user data.", res, false);
      }
  
      let updatedUser = await _User.getOne(userId);
  
      return response.success(actionMessage, res, updatedUser);
    } catch (err) {
      console.error(err);
      return response.internalServerError("An error occurred.", res, false);
    }
  }
  

  async changePassword(req, res) {
    console.log("UsersController@changePassword");
    let data = _.pick(req.body, ["new_password"]);
    let userDetail = req.user;
    let hashedPassword = await _DataHelper.hashPassword(data.new_password);
    await _User.updateOne(userDetail.id, { password: hashedPassword });

    return response.success("password changed successfully.", res, false);
  }


// right old function

// async searchingByNameAndLocation(req, res) {
//   console.log("UserController@searchingByNameAndLocation");
//   const { name, lat, long, face_token } = req.query || {};
//   let { userIds } = req.body || {};
//   const currentUserId = req.user.id;

//   const location = req.uploadData ? req.uploadData.Location : null;
//   console.log("location-----------------", location);
  
//   // Pagination parameters
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   if (userIds && typeof userIds === "string") {
//     userIds = JSON.parse(userIds);
//   }
//    // currently clint requrement name is not required
//   // if (!name || typeof name !== "string" || name.trim().length === 0) {
//   //   return response.badRequest("The 'name' parameter is required and must be a non-empty string.", res, false);
//   // }

//   try {
//     const usersByName = await _User.searchByName(name);

//     let filteredUsers = usersByName;
//     console.log("filteredUsers--------------------", filteredUsers);
    
//     if (lat && long) {
//       const latitude = parseFloat(lat);
//       const longitude = parseFloat(long);

//       if (isNaN(latitude) || isNaN(longitude)) {
//         return response.badRequest("Invalid latitude or longitude values.", res, false);
//       }

//       const usersByLocation = await _UserAddress.searchByLocationRadius(latitude, longitude, 50);
//       const userIdsInRadius = new Set(usersByLocation.map((address) => address.user_id));
//       console.log("usersByLocation--------------------", usersByLocation);
      
//       const usersInRadius = usersByName.filter((user) => userIdsInRadius.has(user.id));

//       if (usersInRadius.length > 0) {
//         filteredUsers = usersInRadius; // Strict Results
//       } else {
//         const relaxedMatch = usersByName.filter(
//           (user) => userIdsInRadius.has(user.id) || usersByName.some((u) => u.id == user.id)
//         );
       
//         if (relaxedMatch.length > 0) {
//           filteredUsers = relaxedMatch; // Relaxed Results
//         } else {
//           const mostRelaxedMatch = usersByName.concat(usersByLocation);
//           filteredUsers = mostRelaxedMatch.filter(
//             (user, index, self) => index == self.findIndex((u) => u.id == user.id)
//           );
//         }
//       }
//     }

//     filteredUsers = filteredUsers.filter((user) => user.id != currentUserId);

//     // For Page 2 and beyond, filter out users who have already been processed in page 1
//     if (page > 1 && userIds && Array.isArray(userIds)) {
//       const alreadyProcessedUserIds = new Set(userIds.map(item => item.user_id));
//       filteredUsers = filteredUsers.filter(user => !alreadyProcessedUserIds.has(user.id));
//     }

//     filteredUsers = await Promise.all(
//       filteredUsers.map(async (user) => {
//         const userPhotos = await _UserPics.getUserPhotos(user.id);
//         const userAddress = await _UserAddress.getByUserId(user.id);
//         const status = await _ProfileLink.getUserLinkStatus(currentUserId, user.id);
//         return {
//           ...user,
//           userAddress: userAddress || null,
//           userPhotos: userPhotos || [],
//           status,
//         };
//       })
//     );

//     let matchedUsers = [];
//     if (userIds && Array.isArray(userIds)) {
//       const userIdsSet = new Set(userIds.map((item) => Number(item.user_id)));

//       matchedUsers = filteredUsers.filter((user) => userIdsSet.has(user.id));

//       if (matchedUsers.length > 0) {
//         matchedUsers = matchedUsers.map((user) => {
//           const match = userIds.find((item) => Number(item.user_id) == user.id);
//           return {
//             ...user,
//             confidence: match?.confidence || null,
//             face_token: match?.face_token || null,
//           };
//         });
//       } else {
//         matchedUsers = filteredUsers.filter((user) => {
//           return (
//             (!name || user.legal_first_name?.toLowerCase().includes(name.toLowerCase()) || user.legal_last_name?.toLowerCase().includes(name.toLowerCase())) 
//             // &&(!location || user.userAddress?.toLowerCase().includes(location.toLowerCase()))
//           );
//         }).map((user) => ({
//           ...user,
//           confidence: null,
//           face_token: null,
//         }));
//       }
      

//       if (!location) {
//         const uniqueUserIds = [...new Set(userIds.map((item) => item.user_id))];
//         for (const userId of uniqueUserIds) {
//           if (userId != currentUserId) {
//             await _Notification.createOne({
//               user_id: currentUserId,
//               sender: currentUserId,
//               receiver: userId,
//               notification_type: "Face Scan",
//             });
//             // Fetch FCM token for the user
//             const apiTokens = await _ApiToken.getByUserId(userId);
//             if (!apiTokens || !apiTokens.fcm_token) {
//               console.warn(`No FCM token found for user ID: ${userId}`);
//               continue;
//             }
//             const pushNotificationData = {
//               tokens: [apiTokens.fcm_token],
//               title: "New Match Found!",
//               body: `You have a new match based on a face scan. Check your profile for more details.`,
//               sender: req.user.id,
//               receiver: userId,
//               notificationType: "MatchAlert",
//               notSaveInDb: true,
//             };
//             // Send push notification
//             try {
//               await _Notification.sendNotificationAndSaveInDatabase(pushNotificationData);
//             } catch (error) {
//               console.error(`Failed to send notification for user ID: ${userId}`, error);
//             }
//           }
//         }

//         // Insert into search_history (Face Scan)
//         await _SearchHistory.createOne({
//           user_id: currentUserId,
//           date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
//           type: "Face Scan",
//           name: name,
//           face_token: face_token,
//           lat: lat? lat: null,
//           long: long? long: null,
//           results: matchedUsers.length,
//         });
//       } else {
//         console.log("inside ");
        
//         // Insert into search_history (Location + Name)
//         await _SearchHistory.createOne({
//           user_id: currentUserId,
//           date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
//           type: "Photo",
//           name: name,
//           face_token: face_token,
//           url: location,
//           lat: lat? lat: null,
//           long: long? long: null,
//           results: matchedUsers.length,
//         });
//       } 
//     }
//     else if (lat && long && location) {
//       // Insert into search_history (Name with location)
//       await _SearchHistory.createOne({
//         user_id: currentUserId,
//         date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
//         type: "Photo",
//         name: name,
//         url: location,
//         lat: lat,
//         long: long,
//         results: filteredUsers.length,
//       });
//     } else if (location) {
//       // Insert into search_history (Location when name + photo sent)
//       await _SearchHistory.createOne({
//         user_id: currentUserId,
//         date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
//         type: "Photo",
//         name: name,
//         url: location,
//         results: filteredUsers.length,
//       });
//     } else if (lat && long) {
//       // Insert into search_history (Name with location)
//       await _SearchHistory.createOne({
//         user_id: currentUserId,
//         date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
//         type: "Name",
//         name: name,
//         lat: lat,
//         long: long,
//         results: filteredUsers.length,
//       });
//     } else {
//       // Insert into search_history (Name only)
//       await _SearchHistory.createOne({
//         user_id: currentUserId,
//         date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
//         type: "Name",
//         name: name,
//         results: filteredUsers.length,
//       });
//     }

//     const totalResults = matchedUsers.length > 0 ? matchedUsers : filteredUsers;
//     const paginatedResults = totalResults.slice(skip, skip + limit); // Apply pagination
    
//     if (paginatedResults.length === 0) {
//       return response.success(
//         "No matching data found for the given name, location, or user IDs.",
//         res,
//         {
//           total: 0,
//           current_page: page,
//           total_pages: 1,
//           per_page: limit,
//           data: []
//         }
//       );
//     }

//     const totalPages = Math.ceil(totalResults.length / limit);
    
//     return response.success(
//       "Data found successfully.",
//       res,
//       {
//         total: totalResults.length,
//         current_page: page,
//         total_pages: totalPages, 
//         per_page: limit,
//         data: paginatedResults,
//       }
//     );
//   } catch (error) {
//     console.error("Error in searchingByNameAndLocation:", error);
//     return response.error("An error occurred while fetching data.", res);
//   }
// }


async searchingByNameAndLocation(req, res) {
  console.log("UserController@searchingByNameAndLocation");
  const { name, lat, long, face_token } = req.query || {};
  let { userIds } = req.body || {};
  const currentUserId = req.user.id;

  const location = req.uploadData ? req.uploadData.Location : null;
  
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (userIds && typeof userIds === "string") {
    userIds = JSON.parse(userIds);
  }
   // currently clint requrement name is not required
  // if (!name || typeof name !== "string" || name.trim().length === 0) {
  //   return response.badRequest("The 'name' parameter is required and must be a non-empty string.", res, false);
  // }

  try {
    const usersByName = await _User.searchByName(name);
    let userIdsArray = []; 
    let filteredUsers = [];
    
    if (Array.isArray(userIds) && userIds.length > 0) {
      userIdsArray = userIds.map(user => user.user_id);
    }
    // Safe fallback with userIdsArray
    filteredUsers = usersByName.length > 0 ? usersByName: await _User.searchUsersByIds(userIdsArray);
    
    if (lat && long) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(long);

      if (isNaN(latitude) || isNaN(longitude)) {
        return response.badRequest("Invalid latitude or longitude values.", res, false);
      }

      const usersByLocation = await _UserAddress.searchByLocationRadius(latitude, longitude, 50);
      const userIdsInRadius = new Set(usersByLocation.map((address) => address.user_id));
      console.log("usersByLocation--------------------", usersByLocation);
      
      const usersInRadius = usersByName.filter((user) => userIdsInRadius.has(user.id));

      if (usersInRadius.length > 0) {
        filteredUsers = usersInRadius; // Strict Results
      } else {
        const relaxedMatch = usersByName.filter(
          (user) => userIdsInRadius.has(user.id) || usersByName.some((u) => u.id == user.id)
        );
       
        if (relaxedMatch.length > 0) {
          filteredUsers = relaxedMatch; // Relaxed Results
        } else {
          const mostRelaxedMatch = usersByName.concat(usersByLocation);
          filteredUsers = mostRelaxedMatch.filter(
            (user, index, self) => index == self.findIndex((u) => u.id == user.id)
          );
        }
      }
    }

    filteredUsers = filteredUsers.filter((user) => user.id != currentUserId);

    // For Page 2 and beyond, filter out users who have already been processed in page 1
    if (page > 1 && userIds && Array.isArray(userIds)) {
      const alreadyProcessedUserIds = new Set(userIds.map(item => item.user_id));
      filteredUsers = filteredUsers.filter(user => !alreadyProcessedUserIds.has(user.id));
    }

    filteredUsers = await Promise.all(
      filteredUsers.map(async (user) => {
        const userPhotos = await _UserPics.getUserPhotos(user.id);
        const userAddress = await _UserAddress.getByUserId(user.id);
        const status = await _ProfileLink.getUserLinkStatus(currentUserId, user.id);
        return {
          ...user,
          userAddress: userAddress || null,
          userPhotos: userPhotos || [],
          status,
        };
      })
    );

    let matchedUsers = [];
    if (userIds && Array.isArray(userIds)) {
      const userIdsSet = new Set(userIds.map((item) => Number(item.user_id)));

      matchedUsers = filteredUsers.filter((user) => userIdsSet.has(user.id));

      if (matchedUsers.length > 0) {
        matchedUsers = matchedUsers.map((user) => {
          const match = userIds.find((item) => Number(item.user_id) == user.id);
          return {
            ...user,
            confidence: match?.confidence || null,
            face_token: match?.face_token || null,
          };
        });
      } else {
        matchedUsers = filteredUsers.filter((user) => {
          return (
            (!name || user.legal_first_name?.toLowerCase().includes(name.toLowerCase()) || user.legal_last_name?.toLowerCase().includes(name.toLowerCase())) 
            // &&(!location || user.userAddress?.toLowerCase().includes(location.toLowerCase()))
          );
        }).map((user) => ({
          ...user,
          confidence: null,
          face_token: null,
        }));
      }
      

      if (!location) {
        const uniqueUserIds = [...new Set(userIds.map((item) => item.user_id))];
        for (const userId of uniqueUserIds) {
          if (userId != currentUserId) {
            await _Notification.createOne({
              user_id: currentUserId,
              sender: currentUserId,
              receiver: userId,
              notification_type: "Face Scan",
            });
            // Fetch FCM token for the user
            const apiTokens = await _ApiToken.getByUserId(userId);
            if (!apiTokens || !apiTokens.fcm_token) {
              console.warn(`No FCM token found for user ID: ${userId}`);
              continue;
            }
            const pushNotificationData = {
              tokens: [apiTokens.fcm_token],
              title: "New Match Found!",
              body: `You have a new match based on a face scan. Check your profile for more details.`,
              sender: req.user.id,
              receiver: userId,
              notificationType: "MatchAlert",
              notSaveInDb: true,
            };
            // Send push notification
            try {
              await _Notification.sendNotificationAndSaveInDatabase(pushNotificationData);
            } catch (error) {
              console.error(`Failed to send notification for user ID: ${userId}`, error);
            }
          }
        }

        // Insert into search_history (Face Scan)
        await _SearchHistory.createOne({
          user_id: currentUserId,
          date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
          type: "Face Scan",
          name: name,
          face_token: face_token,
          lat: lat? lat: null,
          long: long? long: null,
          results: matchedUsers.length,
        });
      } else {
        console.log("inside ");
        
        // Insert into search_history (Location + Name)
        await _SearchHistory.createOne({
          user_id: currentUserId,
          date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
          type: "Photo",
          name: name,
          face_token: face_token,
          url: location,
          lat: lat? lat: null,
          long: long? long: null,
          results: matchedUsers.length,
        });
      } 
    }
    else if (lat && long && location) {
      // Insert into search_history (Name with location)
      await _SearchHistory.createOne({
        user_id: currentUserId,
        date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        type: "Photo",
        name: name,
        url: location,
        lat: lat,
        long: long,
        results: filteredUsers.length,
      });
    } else if (location) {
      // Insert into search_history (Location when name + photo sent)
      await _SearchHistory.createOne({
        user_id: currentUserId,
        date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        type: "Photo",
        name: name,
        url: location,
        results: filteredUsers.length,
      });
    } else if (lat && long) {
      // Insert into search_history (Name with location)
      await _SearchHistory.createOne({
        user_id: currentUserId,
        date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        type: "Name",
        name: name,
        lat: lat,
        long: long,
        results: filteredUsers.length,
      });
    } else {
      // Insert into search_history (Name only)
      await _SearchHistory.createOne({
        user_id: currentUserId,
        date: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        type: "Name",
        name: name,
        results: filteredUsers.length,
      });
    }
    
    const totalResults = matchedUsers.length > 0 ? matchedUsers : filteredUsers;
    const paginatedResults = totalResults.slice(skip, skip + limit); // Apply pagination
    
    if (paginatedResults.length === 0) {
      return response.success(
        "No matching data found for the given name, location, or user IDs.",
        res,
        {
          total: 0,
          current_page: page,
          total_pages: 1,
          per_page: limit,
          data: []
        }
      );
    }

    const totalPages = Math.ceil(totalResults.length / limit);
    
    return response.success(
      "Data found successfully.",
      res,
      {
        total: totalResults.length,
        current_page: page,
        total_pages: totalPages, 
        per_page: limit,
        data: paginatedResults,
      }
    );
  } catch (error) {
    console.error("Error in searchingByNameAndLocation:", error);
    return response.error("An error occurred while fetching data.", res);
  }
}


};
