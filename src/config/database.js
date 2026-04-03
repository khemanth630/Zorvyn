const { Sequelize } = require('sequelize');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env === 'test'
    ? ':memory:'
    : path.join(__dirname, '..', '..', 'database.sqlite'),
  logging: env === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;
