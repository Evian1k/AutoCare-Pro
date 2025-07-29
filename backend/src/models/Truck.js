const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Truck = sequelize.define('Truck', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  truckId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('available', 'dispatched', 'en-route', 'at-location', 'completed', 'maintenance', 'offline'),
    defaultValue: 'available'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'trucks'
});

module.exports = Truck;