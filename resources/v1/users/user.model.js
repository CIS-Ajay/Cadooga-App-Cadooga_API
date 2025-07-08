'use strict';
const Sequelize = require('sequelize');

module.exports = class UserModel extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        legal_first_name:{
          type: DataTypes.STRING,
          allowNull: true
        },
        legal_last_name:{
          type: DataTypes.STRING,
          allowNull: true
        },
        nickname:{
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        username:{
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true
        },
        role: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 2,
          comment: '1 = super_admin, 2 = user'
        },
        email_otp: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null
        },
        email_otp_expiration:{
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true
        },
        is_email_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false
        },
        pasword_reset_token: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        birth_day: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null
        },
        birth_month: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        birth_year: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null
        },
        gender: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        face_token:{
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        },
        relationship_status: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        sexual_identity: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        fav_food: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        about_me: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        fav_place: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        astrology: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        fav_place: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        check_in_location:{
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        },
        shared_to_everyone:{
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        blocked_ids: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: null
        },
        reported_ids: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: null
        },
        is_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false
        },
        is_subscription: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false
        },
        theliveapp_status: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        zodiac_sign_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'zodiac_signs',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        }
      },
      {
        modelName: 'User',
        tableName: 'users',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        sequelize,
      }
    )
  }

  static associate(models) {

    this.belongsTo(models.ZodiacSign, {
      as: 'zodiac_sign',
      foreignKey: 'zodiac_sign_id',
      onDelete: 'SET NULL',
    });
    
    this.hasOne(models.UserAddress, {
      as: 'user_address',
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  }
}