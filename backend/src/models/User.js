const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'driver'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preferences: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('preferences');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('preferences', JSON.stringify(value));
    }
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
User.prototype.toPublicJSON = function() {
  const user = this.toJSON();
  delete user.password;
  return user;
};

// Static method to check if email is admin
User.isAdminEmail = function(email) {
  const ADMIN_EMAILS = [
    'emmanuel.evian@autocare.com',
    'ibrahim.mohamud@autocare.com',
    'joel.nganga@autocare.com',
    'patience.karanja@autocare.com',
    'joyrose.kinuthia@autocare.com',
    'admin@autocare.com'
  ];
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Static method to get admin user data
User.getAdminByEmail = function(email) {
  const adminData = {
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
  
  return adminData[email.toLowerCase()];
};

module.exports = User;