const _ = require("lodash");
const Joi = require("joi");

const DataHelpers = require("../../../helpers/v1/data.helpers");
const _DataHelper = new DataHelpers();

const ResponseHelper = require("../../../helpers/v1/response.helpers");
const response = new ResponseHelper();

const UsersResource = require("./users.resources");
const _User = new UsersResource();


module.exports = class UsersValidation {

  async createOne(req, res, next) {
    console.log('req: ', req);
    console.log("UsersValidation@createOne");

    let schema = {
      email: Joi.string()
        .email({ minDomainSegments: 2 })
        .lowercase()
        .required(),
      password: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[!@#$%^&*])"))
        .required(),
      fcm_token: Joi.string().optional(),
      role: Joi.number().valid(1, 2).optional()
    };

    let errors = await _DataHelper.joiValidation(req.body, schema);
    console.log('errors: ', errors);

    // Return bad request response if there are validation errors
    if (errors) {
      return response.badRequest("Invalid request", res, errors);
    }
    next();
  }


  async createLovedOne(req, res, next) {
    console.log("UsersValidation@createLovedOne");

    let schema = {
      email: Joi.string().email({ minDomainSegments: 2 }).optional(),
      firstname: Joi.string().required(),
      lastname: Joi.string().optional(),
      phone_code: Joi.string().optional(),
      phone_no: Joi.string().optional(),
      address: Joi.string().optional().allow(null, ""),
      relation_id: Joi.number().integer().required(),
      place_id: Joi.string().optional(),
      profile_photo: Joi.string().uri().optional(),
      dob: Joi.string().optional(),
    };

    let errors = await _DataHelper.joiValidation(req.body, schema);

    if (errors) {
      return response.badRequest("invalid_request", res, errors);
    }

    req.body.role_id = role.id;
    next();
  }


  async sendOtp(req, res, next) {
    console.log("UsersValidation@sendOtp");

    let schema = {
      type: Joi.string().required().valid("email", "phone"),
      email: Joi.string().when("type", { is: "email", then: Joi.required() }),
      phone_no: Joi.string().when("type", {
        is: "phone",
        then: Joi.required(),
      }),
      phone_code: Joi.string().when("type", {
        is: "phone",
        then: Joi.required(),
      }),
    };

    let errors = await _DataHelper.joiValidation(req.body, schema);

    if (errors) {
      return response.badRequest("invalid request data", res, errors);
    }

    if (req.body.type === "email") {
      // check if a user with that email already exists
      let newUser = await _User.getByEmail(req.body.email);

      if (newUser) {
        return response.conflict(
          "A user with this email already exists",
          res,
          false
        );
      }
    }

    next();
  }


  async login(req, res, next) {
    console.log("UsersValidation@login");

    let schema = {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      fcm_token: Joi.string().optional()
    };

    let errors = await _DataHelper.joiValidation(req.body, schema);

    if (errors) {
      return response.badRequest("Invalid request data.", res, errors);
    }

    // Check this email address exists in our records
    let user = await _User.getByEmail(req.body.email);

    if (!user) {
      return response.conflict(
        "This email address does not exist in our system.",
        res,
        false
      );
    }

    if (user.email == "admin@cadooga.com") {
      return response.conflict(
        "This is an admin email. You are not allowed to use this here.",
        res,
        false
      );
    }

    // check valid password match for req user
    let isPasswordValid = await _DataHelper.validatePassword(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      return response.conflict("Password not matched.", res, false);
    }

    req.user = user;
    next();
  }


  async adminLogin(req, res, next) {
    console.log("UsersValidation@adminLogin");
  
    let schema = {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    };
  
    let errors = await _DataHelper.joiValidation(req.body, schema);
  
    if (errors) {
      return response.badRequest("Invalid request data.", res, errors);
    }
  
    // Check if this email address exists in our records
    let user = await _User.getByEmail(req.body.email);
    
    if (!user) {
      return response.conflict(
        "This email address does not exist in our system.",
        res,
        false
      );
    }
  
    // Check if the user is an admin (role 1)
    if (user.role !== 1) {
      return response.conflict(
        "Access denied. Only admins are allowed.",
        res,
        false
      );
    }
  
    // Check if the password is valid
    let isPasswordValid = await _DataHelper.validatePassword(
      req.body.password,
      user.password
    );
  
    if (!isPasswordValid) {
      return response.conflict("Password not matched.", res, false);
    }
  
    req.user = user;
    next();
  }
  

  async verifyOtp(req, res, next) {
    console.log("UsersValidation@validatePassword");
    let schema = {
      email: Joi.string()
        .email({ minDomainSegments: 2 })
        .lowercase()
        .required(),
      otp: Joi.string().required(),
      password: Joi.string().required(),
      // type: Joi.string().required().valid('email', 'phone'),
      // email: Joi.string().when('type', { is: 'email', then: Joi.required() }),
      // phone: Joi.string().when('type', { is: 'phone', then: Joi.optional() }),
    };

    let errors = await _DataHelper.joiValidation(req.body, schema);

    if (errors) {
      return response.badRequest("Invalid request data.", res, errors);
    }

    next();
  }


  async resendOtp(req, res, next) {
    console.log("UsersValidation@resendOtp");
    let schema = {
      email: Joi.string()
        .email({ minDomainSegments: 2 })
        .lowercase()
        .required(),
    };

    let errors = await _DataHelper.joiValidation(req.body, schema);

    // Return bad request response if there are validation errors
    if (errors) {
      return response.badRequest("Invalid request", res, errors);
    }
    next();
  }


  async getOne(req, res, next) {
    console.log("UsersValidation@getOne");

    if (!req.params.id && req.params.id == '') {
      return response.badRequest("Id required", res, false);
    }
    next();
  }


  async userBlockAndReport(req, res, next) {
    console.log("UsersValidation@userBlockAndReport");

    let schema = {
      blockedId: Joi.number().integer().optional(),
      reportId: Joi.number().integer().optional(),
      flag: Joi.number().integer().valid(0, 1).optional(),
    };

    let errors = await _DataHelper.joiValidation(req.body, schema);

    // Return bad request response if there are validation errors
    if (errors) {
      return response.badRequest("Invalid request", res, errors);
    }
    next(); 
  }


  async getOneByUUID(req, res, next) {
    console.log("UsersValidation@getOneByUUID");
    if (!req.params.id || req.params.id === "") {
      return response.badRequest("Id required", res, false);
    }
    next();
  }


  async forgetPassword(req, res, next) {
    console.log("UsersValidation@forgetPassword");
    let schema = {
      email: Joi.string()
        .email({ minDomainSegments: 2 })
        .lowercase()
        .required(),
      old_password: Joi.string().optional(),
      new_password: Joi.string().required(),
    };
    let errors = await _DataHelper.joiValidation(req.body, schema);

    if (errors) {
      return response.badRequest("Invalid request data.", res, errors);
    }
    // make sure password meets minimum requirements
    let passwordCheck = await _DataHelper.passwordRegex(req.body.new_password);

    if (!passwordCheck) {
      return response.badRequest(
        "Insecure password, Password must be at least 8 characters long, with 1 capital letter, 1 number and 1 special character",
        res,
        false
      );
    }
    let user = await _User.getByEmail(req.body.email);

    // if coming old password then check in database
    if (req.body.old_password) {
      let userPassord = user.password;
      let oldPasswordString = req.body.old_password;
      let isPasswordValid = await _DataHelper.validatePassword(
        oldPasswordString,
        userPassord
      );
      if (!isPasswordValid) {
        return response.badRequest("Old password not matched.", res, false);
      }
    }

    req.user = user;
    next();
  }


  async updateOne(req, res, next) {
    console.log("UserValidation@updateOne");
    const userId = req.user.id;

    if (!userId) {
      return response.badRequest("Id required.", res, false);
    }

    // make sure the user exists
    let user = await _User.getOne(userId);

    if (!user) {
      return response.notFound("Not found.", res, false);
    }

    let schema = {
      legal_first_name: Joi.string().allow('').optional(),
      legal_last_name: Joi.string().allow('').optional(),
      nickname: Joi.string().allow('').optional(),
      username: Joi.string().allow('').optional(),
      fav_food: Joi.string().allow('').optional(),
      fav_place: Joi.string().allow('').optional(),
      about_me: Joi.string().allow('').optional(),
      shared_to_everyone: Joi.boolean().optional(),
      check_in_location: Joi.string().allow('').optional(),
      birth_day: Joi.number().integer().optional(),
      birth_month: Joi.string().allow('').optional(),
      birth_year: Joi.number().integer().optional(),
      gender: Joi.string().allow('').optional(),
      face_token: Joi.string().allow('').optional(),
      relationship_status: Joi.string().allow('').optional(),
      sexual_identity: Joi.string().allow('').optional(),
      address_name: Joi.string().allow('').optional(),
      latitude: Joi.string().allow('').optional(),
      longitude: Joi.string().allow('').optional(),
      fcm_token: Joi.string().optional(),
      userAddress: Joi.object({
        address_name: Joi.string().allow('').optional(),
        latitude: Joi.string().allow('').optional(),
        longitude: Joi.string().allow('').optional(),
        formated_address: Joi.string().allow('').optional(),
        city: Joi.string().allow('').optional(),
        state: Joi.string().allow('').optional(),
        zipcode: Joi.string().allow('').optional(),
        country: Joi.string().allow('').optional(),
        share_with: Joi.string().allow('').optional(),
      }).optional(),
      userSocial: Joi.object({
        facebook: Joi.string().allow('').optional(),
        instagram: Joi.string().allow('').optional(),
        x_handle: Joi.string().allow('').optional(),
        tiktok: Joi.string().allow('').optional(),
        snapchat: Joi.string().allow('').optional(),
        theliveapp: Joi.string().allow('').optional(),
        linkedin: Joi.string().allow('').optional(),
        spotify: Joi.string().allow('').optional(),
        pitnerest: Joi.string().allow('').optional(),
      }).optional(),
      zodiac_sign_id: Joi.number().integer().optional(),
    };

    let errors = await _DataHelper.joiValidation(req.body, schema);

    if (errors) {
      return response.badRequest("Invalid request data.", res, errors);
    }

    next();
  }


  async getAllUser(req, res, next) {
    console.log("UsersValidation@getAllUser");
    // verify page and size - set default if not provided
    let paginateData = await _DataHelper.getPageAndLimit(req.query);
    req.body.page = paginateData.page;
    req.body.limit = paginateData.limit;

    next();
  }


  async resetPassword(req, res, next) {
    console.log("UsersValidation@changePassword");
    let schema = {
      new_password: Joi.string().min(3).required(),
      confirm_password: Joi.string()
        .min(3)
        .required()
        .valid(Joi.ref("password"))
        .error(() => {
          return {
            message: "Confirm password should match to the password.",
          };
        }),
    };

    let errors = await _DataHelper.joiValidation(req.body, schema);

    if (errors) {
      return response.badRequest("Invalid request data.", res, errors);
    }
    let user = await _User.getByEmail(req.body.email);

    if (user.email !== req.body.email) {
      return response.badRequest("Email not matched.", res, false);
    }
    if (req.body.new_password != req.body.confirm_password) {
      return response.badRequest("Password not matched.", res, false);
    }
    // make sure password meets minimum requirements
    let passwordCheck = await _DataHelper.passwordRegex(req.body.new_password);

    if (!passwordCheck) {
      return response.badRequest(
        "Insecure password. password must be at least 8 characters long, with 1 capital letter, 1 number and 1 special character",
        res,
        false
      );
    }
    req.user = user;
    next();
  }


  async deleteOne(req, res, next) {
    console.log("UsersValidation@deleteOne");
    if (!req.params.id || req.params.id === "") {
      return response.badRequest("User id is required.", res, false);
    }

    // make sure the user exists
    let user = await _User.getOne(req.params.id);

    if (!user) {
      return response.notFound("User not found.", res, false);
    }

    next();
  }


  async logout(req, res, next) {
    console.log("UsersValidation@logout");
    next();
  }


  async updateStatus(req, res, next) {
    console.log("UserValidation@updateStatus");
    if (!req.params.id || req.params.id === "") {
      return response.badRequest("Id required.", res, false);
    }

    // make sure the user exists
    let user = await _User.getOne(req.params.id);

    if (!user) {
      return response.notFound("Not found.", res, false);
    }

    req.user = user;

    next();
  }


  async deleteAccount(req, res, next){
    console.log("UsersValidation@deleteAccount");
    next();
  }


  async changePassword(req, res, next){
    console.log("UsersValidation@changePassword");
    let schema = {
        old_password: Joi.string().required(),
        new_password: Joi.string().min(3).required(),
        confirm_password: Joi.string().min(3).required().valid(Joi.ref('new_password')).error(() => {
            return {
              message: 'Confirm password should match to the password.',
            };
        })
    }

    let errors = await _DataHelper.joiValidation(req.body, schema);
    console.log("errors=====", errors);
    
    if(errors) {
        return response.badRequest('invalid request data', res, errors);
    }

    // make sure password meets minimum requirements
    let passwordCheck = await _DataHelper.passwordRegex(req.body.new_password);
    
    if(!passwordCheck) {
        return response.badRequest('insecure password. password must be at least 8 characters long, with 1 capital letter, 1 number and 1 special character', res, false);
    }

    let userPassword = req.user.password
    let oldPasswordString = req.body.old_password;
    let isPasswordValid = await _DataHelper.validatePassword(oldPasswordString,userPassword)

    if(!isPasswordValid){
        return response.badRequest('old password not matched', res, false);
    }

    next()
  }  


  async searchingByNameAndLocation(req, res, next) {
    console.log("UsersValidation@searchingByNameAndLocation");
  
    const { name, lat, long } = req.query || {};
  
    if (!req.query) {
      return response.badRequest("Missing 'params' in the query.", res, false);
    }
  
    // Validate 'name' (required)
    // if (!name || typeof name !== "string" || name.trim().length === 0) {
    //   return response.badRequest("The 'name' parameter is required and must be a non-empty string.", res, false);
    // }
  
    // Validate 'lat' (optional)
    if (lat && isNaN(parseFloat(lat))) {
      return response.badRequest("The 'lat' parameter must be a valid number.", res, false);
    }
  
    // Validate 'long' (optional)
    if (long && isNaN(parseFloat(long))) {
      return response.badRequest("The 'long' parameter must be a valid number.", res, false);
    }
  
    next();
  }

};
