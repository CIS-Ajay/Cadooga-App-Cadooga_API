"use strict";
const Sequelize = require("sequelize");

module.exports = class ZodiacSignModel extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        start_date: {
          type: DataTypes.STRING, // '03-21' format
          allowNull: false,
        },
        end_date: {
          type: DataTypes.STRING, // '04-19' format
          allowNull: false,
        },
        traits: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
        },
        image_url: {
          type: DataTypes.TEXT,
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
        modelName: "ZodiacSign",
        tableName: "zodiac_signs",
        createdAt: "created_at",     
        updatedAt: "updated_at",     
        paranoid: true,             
        underscored: true,
        sequelize,
      }
    );
  }
};
