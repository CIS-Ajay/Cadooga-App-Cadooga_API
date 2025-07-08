require('dotenv').config();
const {Sequelize} = require('sequelize');

// const sequelize = new Sequelize(process.env.MYSQL_DB_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
//     dialect: 'mysql',
//     // host: process.env.MYSQL_HOST,
//     port: 3306,
//     operatorAliases: false,
//     dialectOptions: {
//         decimalNumbers: true
//     },
// });
const sequelize = new Sequelize(
    process.env.POSTGRES_DB_NAME,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      dialect: 'postgres',
      logging: false,
    }
  );
  
  sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('PostgreSQL connection error:', err.message));

module.exports = sequelize