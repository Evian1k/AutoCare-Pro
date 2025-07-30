const { sequelize } = require('./database');
const User = require('../models/User');
const Payment = require('../models/Payment');
const BankAccount = require('../models/BankAccount');
const Message = require('../models/Message');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Sync all models with database
    await sequelize.sync({ force: false }); // Set force: true to recreate tables
    
    console.log('✅ Database initialized successfully');
    
    // Create default admin user if it doesn't exist
    const adminExists = await User.findOne({ where: { email: 'admin@autocare.com' } });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@autocare.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Default admin user created');
    }

    // Create default bank account if it doesn't exist
    const defaultBankAccount = await BankAccount.findOne({ where: { isDefault: true } });
    
    if (!defaultBankAccount) {
      await BankAccount.create({
        accountName: 'AutoCare Pro Business Account',
        accountNumber: '1234567890',
        bankName: 'Sample Bank',
        bankCode: 'SB001',
        accountType: 'business',
        isDefault: true,
        isActive: true,
        adminNotes: 'Default business account for receiving payments'
      });
      console.log('✅ Default bank account created');
    }
    
    console.log('🎉 Database setup complete!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

module.exports = { initializeDatabase }; 