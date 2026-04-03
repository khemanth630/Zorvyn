const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinancialRecord = sequelize.define('FinancialRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notNull: { msg: 'Amount is required' },
      isDecimal: { msg: 'Amount must be a valid number' },
      min: { args: [0.01], msg: 'Amount must be greater than 0' },
    },
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
    validate: {
      notNull: { msg: 'Type is required' },
      isIn: { args: [['income', 'expense']], msg: 'Type must be income or expense' },
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Category is required' },
      len: { args: [2, 50], msg: 'Category must be between 2 and 50 characters' },
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'Date is required' },
      isDate: { msg: 'Must be a valid date' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'financial_records',
  defaultScope: {
    where: { is_deleted: false },
  },
  scopes: {
    withDeleted: {},
    onlyDeleted: {
      where: { is_deleted: true },
    },
  },
});

module.exports = FinancialRecord;
