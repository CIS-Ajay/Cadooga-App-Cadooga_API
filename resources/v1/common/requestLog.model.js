"use strict";
const Sequelize = require("sequelize");

module.exports = class RequestLogModel extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        host: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        method: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        api_token: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        user_agent: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        base_url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        full_url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        route: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        ip: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        body: {
          type: DataTypes.JSON,
          allowNull: true,
        },
      },
      {
        modelName: "RequestLog",
        tableName: "request_logs",
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true,
        sequelize,
      }
    );
  }
};
