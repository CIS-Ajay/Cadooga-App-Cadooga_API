'use strict';
const Sequelize = require('sequelize');

module.exports = class UserProfileModel extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        return super.init(
            {
              id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
              },
              user_id: {
                type: DataTypes.INTEGER,
                  references: {
                    model: 'users',
                    key: 'id',
                  },
                  onDelete: 'SET NULL'
              },
              fullname: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              firstname: {
                type: DataTypes.STRING,
                allowNull: true,
              },
              lastname: {
                type: DataTypes.STRING,
                allowNull: true
              },
              dob: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null
              },
              address: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: null
              },
              security_code: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              email_otp: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              is_verified: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
              },
              phone_code: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              phone_no: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
              },
              profile_photo: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: null
              },
              is_biometric: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
              },
              is_email_verified:{
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
              },
              created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: new Date()
              },
              updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                onUpdate: 'SET DEFAULT',
                defaultValue: new Date()
              },
              deleted_at: {
                type: DataTypes.DATE,
                allowNull: true
              }
            },
            {
                modelName: 'UserProfile',
                tableName: 'user_profiles',
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                underscored: true,
                sequelize,
            }
        )
    }

}