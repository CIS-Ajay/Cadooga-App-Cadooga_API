"use strict";
const Sequelize = require("sequelize");

module.exports = class UserAddressModel extends Sequelize.Model {
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
        address_name: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        formated_address: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
        },
        city: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        state: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        zipcode: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        country: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        longitude: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        latitude: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        share_with: {
          type: DataTypes.STRING,
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
        },
      },
      {
        modelName: "UserAddress",
        tableName: "user_addresses",
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true,
        sequelize,
      }
    );
  }
};
