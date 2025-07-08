"use strict";
const _ = require("lodash");
const User = require("../users/user.model");
const { Op, literal } = require("sequelize");
// const UsersResource = require("../../v1/users/users.resources");
// const _User = new UsersResource();
// const { Op, fn, col, literal } = require('sequelize');
const ProfileLinkResources = require('../../v1/profileLink/profile_links.resources');
const _ProfileLink = new ProfileLinkResources();

const NotificationsResources = require('../../v1/notifications/notifications.resources');
const _Notification = new NotificationsResources();

function getMonthNumber(monthName) {
    const months = {
      january: 1, february: 2, march: 3, april: 4,
      may: 5, june: 6, july: 7, august: 8,
      september: 9, october: 10, november: 11, december: 12
    };
    return months[monthName?.toLowerCase()] || 1;
}
function getMonthNumber1(monthName) {
    const months = {
      january: 1, february: 2, march: 3, april: 4,
      may: 5, june: 6, july: 7, august: 8,
      september: 9, october: 10, november: 11, december: 12
    };
    return months[monthName?.toLowerCase()] || 1;
}
module.exports = class AdminResource {
  async getByEmail(email) {
    console.log('getByEmail email:', email);
    return await User.findOne({
      where: {
        email,
        role: { [Op.in]: [0, 1] },
        deleted_at: null
      },
      raw: true
    });
  }

  async getAll() {
    return await User.findAll({
      where: { role: { [Op.in]: [0, 1] }, deleted_at: null },
      order: [["created_at", "DESC"]],
      raw: true
    });
  }

  async getOne(id) {
    return await User.findOne({
      where: { id, role: { [Op.in]: [0, 1] }, deleted_at: null },
      raw: true
    });
  }

  async createOne(data) {
    return await User.create(data);
  }

  async updateOne(id, updateData) {
    await User.update(updateData, { where: { id } });
    return await this.getOne(id);
  }

  async softDelete(id) {
    return await User.update(
      { deleted_at: new Date() },
      { where: { id } }
    );
  }

  async resetPassword(id, hashedPassword) {
    return await User.update(
      { password: hashedPassword },
      { where: { id } }
    );
  }

  async getAllUsers(filters = {}, page = 1, limit = 10) {
    try {
      const usePagination = limit <= 500;
      const offset = usePagination ? (page - 1) * limit : 0;
      const effectiveLimit = usePagination ? limit : 10000;
  
      // Construct dynamic WHERE clause
      const where = {};
  
      // Handle search term
      if (filters.searchTerm) {
        const likeTerm = { [Op.iLike]: `%${filters.searchTerm}%` };
        where[Op.or] = [
          { email: likeTerm },
          { legal_first_name: likeTerm },
          { legal_last_name: likeTerm },
          { username: likeTerm },
          { nickname: likeTerm },
        ];
      } else {
        if (filters.legalname) {
          const likeName = { [Op.iLike]: `%${filters.legalname}%` };
          where[Op.or] = [
            { legal_first_name: likeName },
            { legal_last_name: likeName },
          ];
        }
  
        if (filters.email) {
          where.email = { [Op.iLike]: `%${filters.email}%` };
        }
      }
  
      if (filters.subscription_type) {
        where.subscription_type = filters.subscription_type;
      }
  
      // Account status filters
      if (filters.account_status === 'active') {
        where.deleted_at = null;
        where.theliveapp_status = 1;
      } else if (filters.account_status === 'banned') {
        where[Op.or] = [
          { deleted_at: { [Op.not]: null } },
          { theliveapp_status: 0 },
        ];
      } else if (filters.account_status === 'closed') {
        where.deleted_at = { [Op.not]: null };
      }
  
      // Export-specific user IDs
      if (filters.userIds) {
        const ids = filters.userIds
          .split(',')
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
        if (ids.length > 0) {
          where.id = { [Op.in]: ids };
        }
      }
  
      // Count total
      const total = await User.count({ where, paranoid: false });
  
      // Fetch paginated users
      const users = await User.findAll({
        where,
        attributes: [
          'id', 'email', 'username', 'legal_first_name', 'legal_last_name', 'nickname',
          'birth_day', 'birth_month', 'birth_year', 'is_email_verified', 'is_verified',
          'is_subscription', 'role', 'theliveapp_status', 'created_at', 'updated_at', 'deleted_at'
        ],
        order: [['created_at', 'DESC']],
        limit: effectiveLimit,
        offset,
        paranoid: false, // to include deleted users
      });
  
      // Transform users
      const transformedUsers = users.map(user => {
        const u = user.get({ plain: true });
  
        // Determine account status
        let accountStatus = 'active';
        if (u.deleted_at) {
          accountStatus = 'closed';
        } else if (u.theliveapp_status === 0) {
          accountStatus = 'banned';
        }
  
        // Legal name
        const legalName = `${u.legal_first_name || ''} ${u.legal_last_name || ''}`.trim();
  
        // Pseudonym
        const pseudonym = u.nickname || u.username || '';
  
        // Age calculation
        let age = null;
        if (u.birth_year) {
          const today = new Date();
          const birthMonth = typeof u.birth_month === 'string' ? getMonthNumber1(u.birth_month) : u.birth_month;
          age = today.getFullYear() - u.birth_year;
          if (birthMonth > today.getMonth() + 1 || (birthMonth === today.getMonth() + 1 && u.birth_day > today.getDate())) {
            age--;
          }
          if (age < 0) age = null;
        }
  
        const subscriptionType = u.is_subscription ? 'Premium' : 'None';
  
        return {
          ...u,
          legalname: legalName,
          pseudonym,
          age,
          subscription_type: subscriptionType,
          account_status: accountStatus,
          status: accountStatus,
          last_login: u.updated_at,
          is_banned: accountStatus === 'banned',
          banned: accountStatus === 'banned',
        };
      });
  
      return {
        data: transformedUsers,
        pagination: {
          total,
          page: usePagination ? page : 1,
          limit: usePagination ? limit : total,
          pages: usePagination ? Math.ceil(total / limit) : 1
        }
      };
    } catch (error) {
      console.error('Error in getAllUsers (Sequelize):', error);
      throw error;
    }
  }

  async exportUsersToCsv(filters = {}) {
    try {
      const where = {};

      if (filters.searchTerm) {
        where[Op.or] = [
          { email: { [Op.like]: `%${filters.searchTerm}%` } },
          { legal_first_name: { [Op.like]: `%${filters.searchTerm}%` } },
          { legal_last_name: { [Op.like]: `%${filters.searchTerm}%` } },
          { username: { [Op.like]: `%${filters.searchTerm}%` } },
          { nickname: { [Op.like]: `%${filters.searchTerm}%` } },
        ];
      } else {
        if (filters.legalname) {
          where[Op.or] = [
            { legal_first_name: { [Op.like]: `%${filters.legalname}%` } },
            { legal_last_name: { [Op.like]: `%${filters.legalname}%` } },
          ];
        }
        if (filters.pseudonym) {
          where[Op.or] = [
            { nickname: { [Op.like]: `%${filters.pseudonym}%` } },
            { username: { [Op.like]: `%${filters.pseudonym}%` } },
          ];
        }
        if (filters.email) {
          where.email = { [Op.like]: `%${filters.email}%` };
        }
      }

      if (filters.userIds) {
        const userIdArray = filters.userIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        if (userIdArray.length > 0) {
          where.id = { [Op.in]: userIdArray };
        }
      }

      if (filters.subscription_type) {
        if (filters.subscription_type.toLowerCase() === 'paid') {
          where.is_subscription = 1;
        } else if (filters.subscription_type.toLowerCase() === 'free') {
          where.is_subscription = 0;
        }
      }

      if (filters.account_status) {
        if (filters.account_status.toLowerCase() === 'active') {
          where.deleted_at = null;
          where.theliveapp_status = 1;
        } else if (filters.account_status.toLowerCase() === 'banned') {
          where.theliveapp_status = 0;
        } else if (filters.account_status.toLowerCase() === 'closed') {
          where.deleted_at = { [Op.ne]: null };
        }
      }

      const users = await User.findAll({
        where,
        order: [['created_at', 'DESC']],
        raw: true,
      });

      return users.map(user => {
        let age = null;
        if (user.birth_year) {
          const today = new Date();
          const birthMonth = typeof user.birth_month === 'string' ? getMonthNumber(user.birth_month) : (user.birth_month || 1);
          const birthDay = user.birth_day || 1;
          age = today.getFullYear() - user.birth_year;
          if (
            today.getMonth() + 1 < birthMonth ||
            (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)
          ) {
            age--;
          }
          if (age < 0) age = null;
        }

        const legalname = [
          user.legal_first_name || '',
          user.legal_last_name || ''
        ].filter(Boolean).join(' ') || null;

        const pseudonym = user.nickname || user.username || null;

        let accountStatus = 'active';
        if (user.deleted_at) {
          accountStatus = 'closed';
        } else if (user.theliveapp_status === 0) {
          accountStatus = 'banned';
        }

        return {
          id: user.id,
          email: user.email || '',
          legalname,
          pseudonym,
          age,
          subscription_type: user.is_subscription === 1 ? 'PAID' : 'FREE',
          last_login: user.updated_at,
          account_status: accountStatus,
          created_at: user.created_at,
          last_subscribed_at: user.is_subscription === 1 ? user.created_at : null,
        };
      });
    } catch (error) {
      console.error('Error in exportUsersToCsv:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      // Total users (non-deleted)
      const totalUsers = await User.count({
        where: {
          deleted_at: null,
        },
      });
  
      // Active subscriptions
      const activeSubscriptions = await User.count({
        where: {
          is_subscription: true,
          deleted_at: null,
        },
      });
  
      // Closed accounts (soft-deleted users)
      const closedAccounts = await User.count({
        where: {
          deleted_at: {
            [Op.ne]: null,
          },
        },
      });
  
      // Recent logins (based on updated_at in last 24 hours)
      const recentLogins = await User.count({
        where: {
          updated_at: {
            [Op.gt]: literal("NOW() - INTERVAL '24 HOURS'"),
          },
          deleted_at: null,
        },
      });
  
      const stats = {
        totalUsers,
        activeSubscriptions,
        closedAccounts,
        recentLogins,
      };
  
      console.log('Final stats computed:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getStats (Sequelize):', error);
      throw error;
    }
  }
  
  async getAllLinks(userId = null, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // Build base where condition
    const where = {
      notification_type: "Link",
      deleted_at: null,
    };

    if (userId) {
      where[Op.or] = [{ sender: userId }, { receiver: userId }];
    }

    // Find unique link_ids from notifications
    const linkIds = await _Notification.findAll({
      where,
      attributes: [[literal("DISTINCT link_id"), "link_id"]],
      raw: true,
    });

    const total = linkIds.length;
    const linkIdList = linkIds.map((l) => l.link_id);

    const notifications = await _Notification.findAll({
      where: {
        ...where,
        link_id: { [Op.in]: linkIdList },
      },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["id", "email", "legal_first_name", "legal_last_name"],
        },
        {
          model: User,
          as: "Receiver",
          attributes: ["id", "email", "legal_first_name", "legal_last_name"],
        },
      ],
      group: ["link_id"],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      raw: true,
      nest: true,
    });

    const data = await Promise.all(
      notifications.map(async (n) => {
        let title = `Link #${n.link_id}`;
        let description = `Link from ${n.Sender?.legal_first_name || "Unknown"} to ${n.Receiver?.legal_first_name || "Unknown"}`;
        let url = null;

        const profileLink = await _ProfileLink.findByPk(n.link_id);
        if (profileLink) {
          title = profileLink.title || title;
          url = profileLink.url;
        }

        return {
          id: n.link_id,
          notification_id: n.id,
          user_id: n.user_id,
          title,
          url,
          status: n.status,
          sender_id: n.sender,
          receiver_id: n.receiver,
          sender_name: n.Sender ? `${n.Sender.legal_first_name} ${n.Sender.legal_last_name}` : n.sender_name || "Unknown",
          receiver_name: n.Receiver ? `${n.Receiver.legal_first_name} ${n.Receiver.legal_last_name}` : n.receiver_name || "Unknown",
          created_at: n.created_at,
          updated_at: n.updated_at,
        };
      })
    );

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getLinkById(linkId) {
    const notification = await _Notification.findOne({
      where: {
        link_id: linkId,
        notification_type: "Link",
        deleted_at: null,
      },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["id", "email", "legal_first_name", "legal_last_name"],
        },
        {
          model: User,
          as: "Receiver",
          attributes: ["id", "email", "legal_first_name", "legal_last_name"],
        },
      ],
      order: [["created_at", "DESC"]],
      raw: true,
      nest: true,
    });

    if (!notification) return null;

    let title = `Link #${notification.link_id}`;
    let description = "Link details are not available.";
    let url = null;

    const profileLink = await _ProfileLink.findByPk(notification.link_id);
    if (profileLink) {
      title = profileLink.title || title;
      url = profileLink.url;
    } else {
      const post = await Post.findByPk(notification.link_id);
      if (post) {
        description = post.content || description;
      }
    }

    return {
      id: notification.link_id,
      notification_id: notification.id,
      user_id: notification.user_id,
      title,
      description,
      url,
      status: notification.status,
      sender_id: notification.sender,
      receiver_id: notification.receiver,
      sender_name: notification.Sender
        ? `${notification.Sender.legal_first_name} ${notification.Sender.legal_last_name}`
        : notification.sender_name || "Unknown",
      receiver_name: notification.Receiver
        ? `${notification.Receiver.legal_first_name} ${notification.Receiver.legal_last_name}`
        : notification.receiver_name || "Unknown",
      created_at: notification.created_at,
      updated_at: notification.updated_at,
    };
  }

  async updateLinkStatus(linkId, status) {
    const [affected] = await _Notification.update(
      {
        status,
        updated_at: new Date(),
      },
      {
        where: {
          link_id: linkId,
          notification_type: "Link",
          deleted_at: null,
        },
      }
    );

    return affected > 0;
  }

  getMockLinks() {
    return [
      {
        id: 1,
        notification_id: 101,
        user_id: 1,
        title: "Important Project Collaboration",
        description: "This is a link for collaborating on the new project.",
        url: "https://example.com/project/123",
        status: 0,
        sender_id: 2,
        receiver_id: 1,
        sender_name: "Glenne Headly",
        receiver_name: "Admin User",
        created_at: new Date("2025-05-10T08:30:00.000Z"),
        updated_at: new Date("2025-05-10T08:30:00.000Z"),
        source: "notification",
      },
    ];
  }


};
