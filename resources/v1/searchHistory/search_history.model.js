"use strict";
const Sequelize = require("sequelize");

module.exports = class searchHistoryModel extends Sequelize.Model {
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
            onDelete: 'SET NULL'
          },
          date: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
          },
          type: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
          },
          name: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
          },
          face_token: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
          },
          url: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
          },
          lat: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
          },
          long: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
          },
          is_soft_delete:{
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
          },
          results: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
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
            defaultValue: null
          },
      },
      {
        modelName: "SearchHistory",
        tableName: "search_histories",
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true,
        sequelize,
      }
    );
  }
};
