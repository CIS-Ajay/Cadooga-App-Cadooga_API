const Joi = require("joi");
const DataHelpers = require("../../../helpers/v1/data.helpers");
const _DataHelper = new DataHelpers();
const ResponseHelper = require("../../../helpers/v1/response.helpers");
const response = new ResponseHelper();

module.exports = class AdminValidation {
  async login(req, res, next) {
    const schema = {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    };

    const errors = await _DataHelper.joiValidation(req.body, schema);
    if (errors) return response.badRequest("Invalid login data", res, errors);
    next();
  }

  async createOne(req, res, next) {
    const schema = {
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      legal_first_name: Joi.string().optional(),
      legal_last_name: Joi.string().optional(),
      role: Joi.number().valid(0, 1).required(), // 0 = super_admin, 1 = admin
      is_email_verified: Joi.number().valid(0, 1).required(),
    };

    const errors = await _DataHelper.joiValidation(req.body, schema);
    if (errors) return response.badRequest("Invalid request", res, errors);
    next();
  }

  async updateOne(req, res, next) {
    const schema = {
      email: Joi.string().email().optional(),
      legal_first_name: Joi.string().optional(),
      legal_last_name: Joi.string().optional()
    };

    const errors = await _DataHelper.joiValidation(req.body, schema);
    if (errors) return response.badRequest("Invalid update request", res, errors);
    next();
  }

  async resetPassword(req, res, next) {
    const schema = {
      newPassword: Joi.string().min(8).required()
    };

    const errors = await _DataHelper.joiValidation(req.body, schema);
    if (errors) return response.badRequest("Invalid password reset", res, errors);
    next();
  }
};
