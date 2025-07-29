const { sequelize } = require('./database');
const User = require('../models/User');

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
    
    console.log('🎉 Database setup complete!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

module.exports = { initializeDatabase }; 