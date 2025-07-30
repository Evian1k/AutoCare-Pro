const User = require('./User');
const Message = require('./Message');
const Booking = require('./Booking');
const Payment = require('./Payment');
const Truck = require('./Truck');
const Branch = require('./Branch');
const Location = require('./Location');
const BankAccount = require('./BankAccount');
const Notification = require('./Notification');

// Define associations
Booking.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Booking, { as: 'bookings', foreignKey: 'userId' });

Booking.belongsTo(User, { as: 'approvedByUser', foreignKey: 'approvedBy' });
Booking.belongsTo(User, { as: 'rejectedByUser', foreignKey: 'rejectedBy' });
Booking.belongsTo(User, { as: 'completedByUser', foreignKey: 'completedBy' });

module.exports = {
  User,
  Message,
  Booking,
  Payment,
  Truck,
  Branch,
  Location,
  BankAccount,
  Notification
}; 