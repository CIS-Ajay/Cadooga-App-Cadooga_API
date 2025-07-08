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
              phone_no: {
                type: DataTypes.STRING,
                allowNull: true
              },
              otp: {
                type: DataTypes.INTEGER,
                allowNull: true
              },
              is_verified: {
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
              modelName: 'UserPhone',
              tableName: 'user_phones',
              createdAt: 'created_at',
              updatedAt: 'updated_at',
              underscored: true,
              sequelize,
          }
      )
  }

}