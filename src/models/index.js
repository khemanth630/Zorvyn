const sequelize = require('../config/database');
const User = require('./User');
const FinancialRecord = require('./FinancialRecord');

// Define associations
User.hasMany(FinancialRecord, {
  foreignKey: 'created_by',
  as: 'records',
});

FinancialRecord.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

module.exports = {
  sequelize,
  User,
  FinancialRecord,
};
