const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BankAccount = sequelize.define('BankAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  accountNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  bankCode: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  accountType: {
    type: DataTypes.ENUM('savings', 'current', 'business'),
    defaultValue: 'business'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bank_accounts',
  timestamps: true
});

module.exports = BankAccount; 