const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

const ADMIN_EMAILS = [
  'emmanuel.evian@autocare.com',
  'ibrahim.mohamud@autocare.com',
  'joel.nganga@autocare.com',
  'patience.karanja@autocare.com',
  'joyrose.kinuthia@autocare.com',
  'admin@autocare.com'
];

const ADMIN_DATA = {
  'emmanuel.evian@autocare.com': {
    name: 'Emmanuel Evian',
    role: 'admin'
  },
  'ibrahim.mohamud@autocare.com': {
    name: 'Ibrahim Mohamud',
    role: 'admin'
  },
  'joel.nganga@autocare.com': {
    name: 'Joel Ng\'ang\'a',
    role: 'admin'
  },
  'patience.karanja@autocare.com': {
    name: 'Patience Karanja',
    role: 'admin'
  },
  'joyrose.kinuthia@autocare.com': {
    name: 'Joyrose Kinuthia',
    role: 'admin'
  },
  'admin@autocare.com': {
    name: 'Admin User',
    role: 'admin'
  }
};

async function fixAdminUsers() {
  try {
    console.log('🔧 Starting admin user fix...');
    
    // Sync database
    await sequelize.sync();
    console.log('✅ Database synced');
    
    for (const email of ADMIN_EMAILS) {
      console.log(`\n🔍 Checking admin user: ${email}`);
      
      const adminData = ADMIN_DATA[email];
      const adminPassword = process.env.ADMIN_PASSWORD || 'autocarpro12k@12k.wwc';
      
      // Check if user exists
      let user = await User.findOne({ where: { email } });
      
      if (user) {
        console.log(`📋 Found existing user: ${user.name} (Role: ${user.role})`);
        
        // Update role to admin if not already
        if (user.role !== 'admin') {
          console.log(`🔄 Updating role from '${user.role}' to 'admin'`);
          await user.update({ role: 'admin' });
        }
        
        // Ensure user is active
        if (!user.isActive) {
          console.log('🔄 Activating user');
          await user.update({ isActive: true });
        }
        
        // Update name if different
        if (user.name !== adminData.name) {
          console.log(`🔄 Updating name from '${user.name}' to '${adminData.name}'`);
          await user.update({ name: adminData.name });
        }
        
        console.log('✅ User updated successfully');
      } else {
        console.log('➕ Creating new admin user');
        
        // Create new admin user
        user = await User.create({
          name: adminData.name,
          email: email,
          password: adminPassword,
          role: 'admin',
          isActive: true
        });
        
        console.log('✅ Admin user created successfully');
      }
      
      // Verify the user
      const verifiedUser = await User.findOne({ where: { email } });
      console.log(`✅ Verification: ${verifiedUser.name} (Role: ${verifiedUser.role}, Active: ${verifiedUser.isActive})`);
    }
    
    console.log('\n🎉 All admin users fixed successfully!');
    
    // List all admin users
    console.log('\n📋 Current admin users:');
    const allAdmins = await User.findAll({ 
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email', 'role', 'isActive']
    });
    
    allAdmins.forEach(admin => {
      console.log(`  - ${admin.name} (${admin.email}) - Role: ${admin.role}, Active: ${admin.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing admin users:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
fixAdminUsers(); 