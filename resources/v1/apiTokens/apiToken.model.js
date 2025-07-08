"use strict";
const Sequelize = require("sequelize");

module.exports = class ApiTokenModel extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        token: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        fcm_token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "SET NULL",
        },
        device_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        user_agent: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false, // Use `false` instead of `0` for BOOLEAN
        },
        platform: {
          type: DataTypes.TEXT, // Change back to ENUM if restricting values
          allowNull: true,
          defaultValue: null,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW, // Use Sequelize.NOW for automatic timestamps
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW, // Remove `onUpdate` as it's not valid in PostgreSQL
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        modelName: "ApiToken",
        tableName: "api_tokens",
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true,
        sequelize,
      }
    );
  }

  static associate(models) {}
};