// db.sync.js
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB_NAME,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    dialect: process.env.DB_DRIVER || 'postgres',
    logging: false,
  }
);

// Function to load all models recursively
const loadModels = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      loadModels(fullPath);
    } else if (file.endsWith('.model.js')) {
      const model = require(fullPath);
      if (model.init) model.init(sequelize, Sequelize.DataTypes);
    }
  });
};

// Load models from your actual structure
loadModels(path.join(__dirname, 'resources/v1'));

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    await sequelize.sync({ alter: true }); 
    console.log('All models were synchronized successfully.');
    process.exit();
  } catch (err) {
    console.error('Failed to sync models:', err);
    process.exit(1);
  }
})();
