'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('api_tokens', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      token: Sequelize.STRING,
      fcm_token: Sequelize.STRING,
      user_id: Sequelize.INTEGER,
      device_id: Sequelize.STRING,
      user_agent: Sequelize.STRING,
      is_active: Sequelize.BOOLEAN,
      platform: Sequelize.STRING,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('api_tokens');
  }
};
