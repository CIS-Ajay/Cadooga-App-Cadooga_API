"use strict";
const Sequelize = require("sequelize");

module.exports = class profileLinkModel extends Sequelize.Model {
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
                model: 'users',
                key: 'id',
              },
              onDelete: 'SET NULL'
          },
          sender: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
          },
          receiver: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
          },
          link_date: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
          },
          status: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: '0 means pending, 1 means declined, 2 means accepted, 3 means unlink'
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            onUpdate: 'SET DEFAULT',
            defaultValue: Sequelize.NOW,
          },
          deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
          }
      },
      {
        modelName: "ProfileLink",
        tableName: "profile_links",
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true,
        sequelize,
      }
    );
  }
};
