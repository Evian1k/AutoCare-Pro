const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  conversationId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  senderType: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAutoReply: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'messages'
});

module.exports = Message;