const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookingNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  serviceType: {
    type: DataTypes.ENUM('delivery', 'pickup', 'transport', 'maintenance', 'emergency'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'bookings'
});

module.exports = Booking;