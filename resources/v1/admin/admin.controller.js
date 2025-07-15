// resources/v1/admin/admin.controller.js

const _ = require("lodash");
const bcrypt = require("bcryptjs");

const DataHelper = require("../../../helpers/v1/data.helpers");
const _DataHelper = new DataHelper();

const ResponseHelper = require("../../../helpers/v1/response.helpers");
const response = new ResponseHelper();

const AdminResource = require("./admin.resources");
const _Admin = new AdminResource();

const UsersResource = require("../../v1/users/users.resources");
const _User = new UsersResource();

const NodeMailerService = require("../../../services/nodemailer");
const _NodeMailer = new NodeMailerService();

const djangoEndpoints = require("../../../config/djangoEndpoints");
const { enqueueDjangoSync } = require("../../../services/enqueueDjangoSync");
const { forwardToDjango } = require("../../../services/djangoService");
const jwt = require("jsonwebtoken");
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

const { generateResetEmailHtml } = require("../../../emailTemplates/resetEmail");
module.exports = class AdminController {

  async sendPasswordReset(req, res) {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
  
    try {
      const user = await _User.getByEmail(email);
      console.log('user:', user);
      if (!user) return response.notFound("User not found.", res);
  
      // Generate a JWT token with 15-minute expiry
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );
  
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
      const html = await generateResetEmailHtml(resetUrl, user);
  
      const sent = await _NodeMailer.sendMailNodemailer(
        process.env.SUPPORT_MAIL,
        email,
        "Reset your password",
        html
      );
  
      if (!sent) {
        return response.exception("Failed to send email", res);
      }
  
      return response.success("Reset link sent to email.", res, resetUrl);
  
    } catch (err) {
      console.error("resendOtp error", err);
      return response.internalServerError("Server error", res);
    }
  }

  async login(req, res) {
    console.log("AdminController@login");
    const { email, password } = req.body;
    console.log('email, password:', email, password);

    if (!email || !password) {
      return response.badRequest("Email and password are required", res);
    }

    try {
      const admin = await _Admin.getByEmail(email);
      console.log('------admin:', admin);
      if (!admin) return response.unauthorized("Invalid credentials", res);

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return response.unauthorized("Invalid credentials", res);

      // const token = jwt.sign(
      //   { id: admin.id, email: admin.email, role: admin.role },
      //   process.env.JWT_SECRET || 'your-default-secret-key',
      //   { expiresIn: "24h" }
      // );
      let token = await _DataHelper.generateToken({
        id: admin.id,
        email: admin.email,
        user_id: admin.id,
      });

      delete admin.password;

      return response.success("Login successful", res, {
        token,
        user: admin
      });
    } catch (err) {
      console.error("Login error:", err);
      return response.internalServerError("Login failed", res, err.message);
    }
  }

  async getAll(req, res) {
    console.log("AdminController@getAll");
    try {
      const admins = await _Admin.getAll();
      return response.success("Admin users fetched", res, admins);
    } catch (err) {
      console.error("Fetch error:", err);
      return response.internalServerError("Failed to fetch admin users", res, err.message);
    }
  }

  async getOne(req, res) {
    console.log("AdminController@getOne");
    try {
      const admin = await _Admin.getOne(req.params.id);
      if (!admin) return response.notFound("Admin not found", res);
      return response.success("Admin user fetched", res, admin);
    } catch (err) {
      console.error("Fetch error:", err);
      return response.internalServerError("Failed to fetch admin user", res, err.message);
    }
  }

  async createOne(req, res) {
    console.log("AdminController@createOne");
    const data = _.pick(req.body, ["email", "password", "legal_first_name", "legal_last_name" ]);

    try {
      const exists = await _Admin.getByEmail(data.email);
      if (exists) return response.badRequest("Email already exists", res);

      const hashed = await bcrypt.hash(data.password, 10);
      data.password = hashed;
      data.role = 1;
      data.is_email_verified = true;

      const created = await _Admin.createOne(data);

      // Prepare Django sync payload
      const config = djangoEndpoints.AUTH.REGISTER;
      const djangoPayload = {
        endpoint: config.endpoint,
        method: config.method,
        data: {
          id: created.id,
          email: created.email,
          password: req.body.password, // Send raw password to Django
          legal_first_name: data.legal_first_name,
          legal_last_name: data.legal_last_name,
          role: data.role,
          is_verified: true,
          is_email_verified: true,
        },
      };
      try {
        await forwardToDjango(djangoPayload);
  
        return res.status(201).json({
          success: true,
          message: 'Admin created and synced with Django successfully',
          data: {
            id: created.id,
            email: created.email,
          }
        });
  
      } catch (err) {
        const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
  
        if (isRetryable) {
          await enqueueDjangoSync({
            jobIdPrefix: "sync-admin",
            payload: { ...djangoPayload, id: created.id }
          });
  
          return res.status(201).json({
            success: true,
            message: "Admin created. Django sync is queued.",
            data: {
              id: created.id,
              email: created.email,
            },
          });
        }
  
        return res.status(err.status || 500).json({
          success: false,
          message: "Django sync failed",
          error: typeof err.message === 'object' ? err.message : { error: err.message },
        });
      }  
    } catch (err) {
      console.error("Create error:", err);
      return response.internalServerError("Failed to create admin", res, err.message);
    }
  }

  async updateOne(req, res) {
    console.log("AdminController@updateOne");
    const { id } = req.params;
    const updateData = _.pick(req.body, [
      "legal_first_name",
      "legal_last_name",
      "email"
    ]);

    try {
      const updatedAdmin = await _Admin.updateOne(id, updateData);
      if (!updatedAdmin) {
        return response.exception("Admin not found or update failed", res, false);
      }

      // Prepare payload for Django sync
      const config = djangoEndpoints.AUTH.UPDATE_PROFILE;
      const djangoPayload = {
        endpoint: config.endpoint,
        method: config.method,
        data: {
          email: updatedAdmin.email,
          legal_first_name: updatedAdmin.legal_first_name,
          legal_last_name: updatedAdmin.legal_last_name,
        },
        headers: {
          Authorization: req.headers["authorization"]
        }
      };

      try {
        await forwardToDjango(djangoPayload);
        return response.success("Admin updated and synced", res, updatedAdmin);  
      } catch (err) {
        const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
        if (isRetryable) {
          await enqueueDjangoSync({
            jobIdPrefix: "update-admin",
            payload: {
              ...djangoPayload,
              id: updatedAdmin.id,
            }
          });
          return response.success("Admin updated. Django sync is queued.", res, updatedAdmin);
        }
        return res.status(err.status || 500).json({
          status_code: err.status || 500,
          message: err.message || "Failed to sync with Django",
          data: {},
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      return response.internalServerError("Failed to update admin", res, err.message);
    }
  }

  async deleteOne(req, res) {
    console.log("AdminController@deleteOne");
    try {
      if (parseInt(req.params.id) === req.user.id) {
        return response.badRequest("Cannot delete yourself", res);
      }

      const deleted = await _Admin.softDelete(req.params.id);
      return response.success("Admin deleted", res, deleted);
    } catch (err) {
      console.error("Delete error:", err);
      return response.internalServerError("Failed to delete admin", res, err.message);
    }
  }

  async resetPassword(req, res) {
    console.log("AdminController@resetPassword");
    try {
      const { newPassword } = req.body;
      const hashed = await bcrypt.hash(newPassword, 10);
      const updated = await _Admin.resetPassword(req.params.id, hashed);
      return response.success("Password reset successful", res, updated);
    } catch (err) {
      console.error("Reset error:", err);
      return response.internalServerError("Failed to reset password", res, err.message);
    }
  }

  async profile(req, res) {
    console.log("AuthController@profile");
    try {
      const userId = req.user.id;
      const user = await _User.getOne(userId);

      if (!user) {
        return response.notFound("User not found", res);
      }
      delete user.password;

      return response.success("Profile fetched", res, user);
    } catch (err) {
      console.error("Profile fetch error:", err);
      return response.internalServerError("Failed to fetch profile", res, err.message);
    }
  }


/**
 * Controller for handling user-related operations
 */
  async getUsers(req, res) {
    try {
      console.log('getUsers controller called with query:', req.query);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Extract filter parameters from query
      const filters = {
        legalname: req.query.legalname,
        email: req.query.email,
        subscription_type: req.query.subscription_type,
        account_status: req.query.account_status,
        searchTerm: req.query.searchTerm
      };

      // Only keep defined filters
      Object.keys(filters).forEach((key) => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      console.log('Applying filters:', filters);

      const result = await _Admin.getAllUsers(filters, page, limit);
      console.log(`Returning ${result.data.length} users to client, total: ${result.pagination.total}`);
      res.json(result);
    } catch (error) {
      console.error('Error in getUsers controller:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  async getUserById(req, res) {
    try {
      const userId = req.params.id;
      console.log(`Fetching user with ID: ${userId}`);

      // Try to get user from database
      const user = await _User.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error(`Error in getUserById controller for ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const userData = req.body;
      
      // Log update information for debugging
      console.log(`Updating user ${userId} with data:`, userData);
      
      // Validate user exists
      const existingUser = await _User.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user data
      const success = await _User.updateUser(userId, userData);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to update user' });
      }
      
      // Get updated user data
      const updatedUser = await _User.getUserById(userId);
      const config = djangoEndpoints.AUTH.UPDATE_PROFILE_ADMIN;
      // Prepare Django sync payload
      const djangoPayload = {
        endpoint: `${config.endpoint}${updatedUser.id}/`,
        method: config.method,
        data: {
          legal_first_name: updatedUser.legal_first_name,
          legal_last_name: updatedUser.legal_last_name,
          nickname: updatedUser.nickname,
        },
        headers: {
          Authorization: req.headers["authorization"],
        },
      };  
        try {
        const ress = await forwardToDjango(djangoPayload);
        console.log('ress:===', ress);
        return res.json({ message: 'User updated successfully', user: updatedUser });
      } catch (err) {
        const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
  
        if (isRetryable) {
          await enqueueDjangoSync({
            jobIdPrefix: "update-user",
            payload: {
              ...djangoPayload,
              id: updatedUser.id
            }
          });
  
          return res.json({
            message: 'User updated successfully. Django sync is queued.',
            user: updatedUser
          });
        }
  
        return res.status(err.status || 500).json({
          message: err.message || 'Failed to sync with Django',
          error: err
        });
      }
  
      // res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
      console.error(`Error in updateUser controller for ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  async clearDeviceId(req, res) {
  try {
    const userId = req.params.id;
    
    // Validate user exists
    const existingUser = await _User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Clear device ID
    const success = await _User.clearDeviceId(userId);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to clear device ID' });
    }
    // Get updated user
    const updatedUser = await _User.getUserById(userId);

    const config = djangoEndpoints.AUTH.UPDATE_PROFILE_ADMIN;
    const djangoPayload = {
      endpoint: `${config.endpoint}${updatedUser.id}/`,
      method: config.method,
      data: {
        face_token: null
      },
      headers: {
        Authorization: req.headers["authorization"]
      }
    };

    try {
      await forwardToDjango(djangoPayload);
      return res.json({ message: 'Device ID cleared successfully' });
    } catch (err) {
      const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";

      if (isRetryable) {
        await enqueueDjangoSync({
          jobIdPrefix: "update-user-device",
          payload: {
            ...djangoPayload,
            id: updatedUser.id
          }
        });

        return res.json({
          message: 'Device ID cleared. Django sync is queued.'
        });
      }

      return res.status(err.status || 500).json({
        message: err.message || 'Failed to sync with Django',
        error: err
      });
    }
  } catch (error) {
    console.error(`Error in clearDeviceId controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
  };

  async resetPasswordByToken(req, res) {
    try {
      const { token, password } = req.body;
      console.log('token, password:', token, password);
      if (!token || !password || password.length < 8) {
        return res.status(400).json({ message: 'Invalid token or password too short' });
      }
  
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      const userId = decoded.id;
  
      const user = await _User.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const success = await _User.updateOne(userId, {
        password: hashedPassword,
      });
      console.log('success:====', success);
  
      if (!success) {
        return res.status(400).json({ message: 'Failed to reset password' });
      }
      
      // django sync
      const config = djangoEndpoints.AUTH.RESET_PASSWORD;
      const djangoPayload = {
        endpoint: config.endpoint,
        method: config.method,
        data: {
          password,
          id: userId,
        },
      };
      try {
        await forwardToDjango(djangoPayload);
        console.log('Password reset successfully and synced with Django');
        return res.status(200).json({ message: 'Password reset successfully' });
      } catch (err) {
        const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
        if (isRetryable) {
          await enqueueDjangoSync({
            jobIdPrefix: "reset-password",
            payload: djangoPayload,
          });
          console.log('Password reset successfully. Django sync is queued.');
          return res.status(200).json({
            message: 'Password reset successfully. Django sync is queued.'
          });
        }
        console.error('Failed to sync password reset with Django:', err);
        return res.status(err.status || 500).json({
          message: err.message || 'Failed to sync with Django',
          error: err
        });
      }  
    } catch (error) {
      console.error("Error resetting password:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
  
  async updateSubscription(req, res) {
  try {
    const userId = req.params.id;
    const { subscriptionType, isTrialPeriod } = req.body;
    
    // Validate required fields
    if (!subscriptionType) {
      return res.status(400).json({ message: 'Subscription type is required' });
    }
    
    // Validate user exists
    const existingUser = await _User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update subscription
    const success = await _User.updateSubscription(userId, subscriptionType, isTrialPeriod);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to update subscription' });
    }
    
    const updatedUser = await _User.getUserById(userId);
    res.json({ 
      message: `Subscription updated to ${subscriptionType}${isTrialPeriod ? ' (trial)' : ''}`,
      user: updatedUser
    });
  } catch (error) {
    console.error(`Error in updateSubscription controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

  async updateAccountStatus(req, res) {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({ message: 'Account status is required' });
    }
    
    // Validate status value
    const validStatuses = ['active', 'banned', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Status must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Validate user exists
    const existingUser = await _User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update account status
    const success = await _User.updateAccountStatus(userId, status);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to update account status' });
    }
    
    const message = status === 'banned' ? 'User banned successfully' : 
                   status === 'active' ? 'User account restored successfully' :
                   'User account status updated successfully';
                   
    res.json({ message });
  } catch (error) {
    console.error(`Error in updateAccountStatus controller for ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
  };

  async exportUsers(req, res) {
    try {
      // Extract filter parameters from query
      const filters = {
        legalname: req.query.legalname,
        pseudonym: req.query.pseudonym,
        email: req.query.email,
        subscription_type: req.query.subscription_type,
        account_status: req.query.account_status,
        expired: req.query.expired === 'true',
        closed: req.query.closed === 'true'
      };
      
      // Only keep defined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });
      
      console.log('Exporting users with filters:', filters);
      
      // Get users based on filters
      const users = await _Admin.exportUsersToCsv(filters);
      
      // Format dates in user data
      const formattedUsers = users.map(user => {
        return {
          id: user.id,
          email: user.email,
          legalname: user.legalname,
          pseudonym: user.pseudonym,
          age: user.age,
          subscription_type: user.subscription_type,
          last_login: user.last_login ? new Date(user.last_login).toISOString() : '',
          account_status: user.account_status,
          created_at: user.created_at ? new Date(user.created_at).toISOString() : '',
          last_subscribed_at: user.last_subscribed_at ? new Date(user.last_subscribed_at).toISOString() : ''
        };
      });
      
      // Create CSV writer
      const csvStringifier = createCsvStringifier({
        header: [
          { id: 'id', title: 'ID' },
          { id: 'email', title: 'Email' },
          { id: 'legalname', title: 'Legal Name' },
          { id: 'pseudonym', title: 'Pseudonym' },
          { id: 'age', title: 'Age' },
          { id: 'subscription_type', title: 'Subscription Type' },
          { id: 'last_login', title: 'Last Login' },
          { id: 'account_status', title: 'Account Status' },
          { id: 'created_at', title: 'Created At' },
          { id: 'last_subscribed_at', title: 'Last Subscribed At' }
        ]
      });
      
      // Generate CSV
      const csvHeader = csvStringifier.getHeaderString();
      const csvContent = csvStringifier.stringifyRecords(formattedUsers);
      const csv = csvHeader + csvContent;
      
      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      
      // Send CSV response
      res.send(csv);
    } catch (error) {
      console.error('Error in exportUsers controller:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  async getUserStats(req, res) {
  try {
    console.log('getUserStats controller called');
    // Use the User model method to get stats
    const stats = await _Admin.getStats();
    console.log('Stats from model:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error in getUserStats controller:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
 };

/**
 * Ban a user
 */
  async banUser(req, res) {
    try {
      const userId = req.params.id;
      const { reason = 'Banned by admin' } = req.body;
      
      console.log(`Attempting to ban user ${userId} with reason: ${reason}`);
      
      // Validate user exists
      const existingUser = await _User.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      // Ban the user by updating account status
      const success = await _User.updateAccountStatus(userId, 'banned');
      if (!success) {
        return res.status(400).json({ success: false, message: 'Failed to ban user' });
      }

      const config = djangoEndpoints.AUTH.UPDATE_PROFILE_ADMIN;
      const djangoPayload = {
        endpoint: `${config.endpoint}${userId}/`,
        method: config.method,
        data: {
          theliveapp_status: false,
        },
        headers: {
          Authorization: req.headers["authorization"],
        },
      };
  
      console.log(`User ${userId} banned successfully`);
      try {
        await forwardToDjango(djangoPayload);
        return res.json({ success: true, message: 'User banned successfully' });
      } catch (err) {
        const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
        if (isRetryable) {
          await enqueueDjangoSync({
            jobIdPrefix: "ban-user",
            payload: { ...djangoPayload, id: userId },
          });
          return res.json({
            success: true,
            message: 'User banned. Django sync is queued.',
          });
        }
        return res.status(err.status || 500).json({
          success: false,
          message: 'Ban failed during Django sync.',
          error: err.message || err,
        });
      }
      } catch (error) {
      console.error(`Error in banUser controller for ID ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false,
        message: 'Server error', 
        error: error.message 
      });
    }
  };

/**
 * Unban a user
 */
  async unbanUser(req, res) {
    try {
      const userId = req.params.id;
      
      console.log(`Attempting to unban user ${userId}`);
      
      // Validate user exists
      const existingUser = await _User.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      const success = await _User.updateAccountStatus(userId, 'active');
      if (!success) {
        return res.status(400).json({ success: false, message: 'Failed to unban user' });
      }

      const config = djangoEndpoints.AUTH.UPDATE_PROFILE_ADMIN;
      const djangoPayload = {
        endpoint: `${config.endpoint}${userId}/`,
        method: config.method,
        data: {
          theliveapp_status: true,
          deleted_at: null,
        },
        headers: {
          Authorization: req.headers["authorization"],
        },
      };

      try {
        await forwardToDjango(djangoPayload);
        return res.json({ success: true, message: 'User unbanned successfully' });
      } catch (err) {
        const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
        if (isRetryable) {
          await enqueueDjangoSync({
            jobIdPrefix: "unban-user",
            payload: { ...djangoPayload, id: userId },
          });
          return res.json({
            success: true,
            message: 'User unbanned. Django sync is queued.',
          });
        }
        return res.status(err.status || 500).json({
          success: false,
          message: 'Unban failed during Django sync.',
          error: err.message || err,
        });
      }
    } catch (error) {
      console.error(`Error in unbanUser controller for ID ${req.params.id}:`, error);
      res.status(500).json({ 
        success: false,
        message: 'Server error', 
        error: error.message 
      });
    }
  };

/**
 * Verify a user - Updated to only use is_email_verified
 */
  async verifyUser(req, res) {
    const userId = req.params.id;
    try {
      const existingUser = await _User.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const success = await _User.updateUser(userId, { is_email_verified: true });
      if (!success) {
        return res.status(400).json({ message: 'Failed to verify user' });
      }
      // Prepare payload for Django sync
      const config = djangoEndpoints.AUTH.UPDATE_PROFILE_ADMIN;
      const djangoPayload = {
        endpoint: `${config.endpoint}${userId}/`,
        method: config.method,
        data: {
          is_email_verified: true,
        },
        headers: {
          Authorization: req.headers["authorization"],
        },
      };


      try {
        await forwardToDjango(djangoPayload);
        return res.json({ message: 'User verified successfully' });
      } catch (err) {
        const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
        if (isRetryable) {
          await enqueueDjangoSync({
            jobIdPrefix: "verify-user",
            payload: { ...djangoPayload, id: userId },
          });
          return res.json({
            message: 'User verified. Django sync is queued.',
          });
        }

        return res.status(err.status || 500).json({
          message: 'Verification failed during Django sync.',
          error: err.message || err,
        });
      }
    } catch (error) {
      console.error(`Error in verifyUser controller for ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

/**
 * Remove verification from a user - Updated to only use is_email_verified
 */
  async removeVerification(req, res){
    const userId = req.params.id;
    try {
      // Validate user exists
      const existingUser = await _User.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update only the is_email_verified field
      const success = await _User.updateUser(userId, { is_email_verified: false });
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to remove verification' });
      }
      // Prepare payload for Django sync
      const config = djangoEndpoints.AUTH.UPDATE_PROFILE_ADMIN;
      const djangoPayload = {
        endpoint: `${config.endpoint}${userId}/`,
        method: config.method,
        data: { is_email_verified: false },
        headers: { Authorization: req.headers["authorization"] },
      };

      try {
        await forwardToDjango(djangoPayload);
        return res.json({ message: 'User verification removed successfully' });
      } catch (err) {
        const isRetryable = err.status >= 500 || err.code === "ECONNABORTED";
        if (isRetryable) {
          await enqueueDjangoSync({
            jobIdPrefix: "remove-verification",
            payload: { ...djangoPayload, id: userId },
          });
          return res.json({
            message: 'User verification removed. Django sync is queued.',
          });
        }

        return res.status(err.status || 500).json({
          message: 'Django sync failed during verification removal.',
          error: err.message || err,
        });
      }
    } catch (error) {
      console.error(`Error in removeVerification controller for ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  async healthCheck(req, res) {
    console.log("AdminController@healthCheck");
    try {
      return response.success("Admin service is healthy", res);
    } catch (err) {
      console.error("Health check error:", err);
      return response.internalServerError("Health check failed", res, err.message);
    }
  }

/**
 * Get mock links for testing
 */
  async getLinks(req, res) {
    try {
      const data = await _Admin.getAllLinks(req.query.userId, req.query.page, req.query.limit);
      return response.success("Links fetched", res, data);
    } catch (err) {
      return response.internalServerError("Failed to fetch links", res, err.message);
    }
  }

  async getLinkById(req, res) {
    try {
      const data = await _Admin.getLinkById(req.params.id);
      if (!data) return response.notFound("Link not found", res);
      return response.success("Link fetched", res, data);
    } catch (err) {
      return response.internalServerError("Failed to fetch link", res, err.message);
    }
  }

  async updateLinkStatus(req, res) {
    try {
      const success = await _Admin.updateLinkStatus(req.params.id, req.body.status);
      if (!success) return response.notFound("Link not found or not updated", res);
      return response.success("Link status updated", res);
    } catch (err) {
      return response.internalServerError("Failed to update link", res, err.message);
    }
  }

  async getMockLinks(req, res) {
    try {
      const data = _Admin.getMockLinks();
      return response.success("Mock links fetched", res, {
        data,
        pagination: {
          total: data.length,
          page: 1,
          limit: data.length,
          pages: 1
        }
      });
    } catch (err) {
      return response.internalServerError("Failed to fetch mock links", res, err.message);
    }
  }

};
