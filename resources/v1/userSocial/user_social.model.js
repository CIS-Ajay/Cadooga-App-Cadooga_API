'use strict';
const Sequelize = require('sequelize');

module.exports = class UserPhoneModel extends Sequelize.Model {
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
              facebook: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              instagram: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: null
              },
              x_handle: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              tiktok: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              snapchat: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              theliveapp: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              linkedin: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              spotify: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              pitnerest: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
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
              modelName: 'UserSocial',
              tableName: 'user_socials',
              createdAt: 'created_at',
              updatedAt: 'updated_at',
              underscored: true,
              sequelize,
          }
      )
  }

}