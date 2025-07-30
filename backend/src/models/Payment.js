const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  paymentMethod: {
    type: DataTypes.ENUM('mobile_money', 'bank_transfer', 'paypal', 'mock'),
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  bankAccount: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminBankAccount: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  adminBankName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  adminBankCode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  paymentProof: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment; 