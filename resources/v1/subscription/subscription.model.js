"use strict";
const Sequelize = require("sequelize");

module.exports = class SubscriptionModel extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE", //'SET NULL'
        },
        receipt: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
        },
        platform: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
        },
        plan_id: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        start_date: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW,
        },
        end_date: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          onUpdate: "SET DEFAULT",
          defaultValue: Sequelize.NOW,
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        modelName: "Subscription",
        tableName: "subscriptions",
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true,
        sequelize,
      }
    );
  }
};
