'use strict';
const Sequelize = require('sequelize');

module.exports = class SettingModel extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },
                privacy: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                tearms_condition: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                logo: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: new Date(),
                },
                updated_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    onUpdate: 'SET DEFAULT',
                    defaultValue: new Date(),
                },
                deleted_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                }
            },
            {
                modelName: 'Setting',
                tableName: 'settings',
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                underscored: true,
                sequelize,
            }
        )
    }


}