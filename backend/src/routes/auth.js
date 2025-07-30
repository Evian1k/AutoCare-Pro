const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { checkDuplicateEmail, checkEmailAvailability } = require('../middleware/duplicateEmailCheck');

const router = express.Router();

// JWT token generation
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// @route   GET /api/v1/auth/check-email/:email
// @desc    Check if email is available for registration
// @access  Public
router.get('/check-email/:email', checkEmailAvailability);

// @route   GET /api/v1/auth/validate
// @desc    Validate JWT token and return user data
// @access  Private
router.get('/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret');
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.role === 'admin',
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// @route   GET /api/v1/auth/debug-user/:email
// @desc    Debug user information (for development)
// @access  Public
router.get('/debug-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        debug: {
          email,
          isAdminEmail: User.isAdminEmail(email),
          adminData: User.getAdminByEmail(email)
        }
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      debug: {
        isAdminEmail: User.isAdminEmail(email),
        adminData: User.getAdminByEmail(email),
        isAdmin: user.role === 'admin',
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error'
    });
  }
});

// @route   POST /api/v1/auth/register
// @desc    Register a new user with duplicate email protection
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
], 
async (req, res) => {
  try {
    console.log('Registration attempt:', { 
      email: req.body.email, 
      name: req.body.name,
      hasPassword: !!req.body.password 
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists (for regular users only)
    const existingUser = await User.findOne({ where: { email } });
    
    // Check if trying to register with admin email
    console.log('Checking if admin email:', email, 'Is admin:', User.isAdminEmail(email));
    if (User.isAdminEmail(email)) {
      // Admin registration - verify admin password
      const adminPassword = process.env.ADMIN_PASSWORD || 'autocarpro12k@12k.wwc';
      console.log('Admin password check:', { 
        provided: password, 
        expected: adminPassword, 
        match: password === adminPassword 
      });
      
      if (password !== adminPassword) {
        console.log('Admin password mismatch');
        return res.status(403).json({
          success: false,
          message: 'Invalid admin password for admin registration.',
          code: 'INVALID_ADMIN_PASSWORD'
        });
      }
      
      // Get admin data
      const adminData = User.getAdminByEmail(email);
      console.log('Admin data for email:', email, adminData);
      
      if (!adminData) {
        console.log('No admin data found for email:', email);
        return res.status(403).json({
          success: false,
          message: 'Email not authorized for admin registration.',
          code: 'UNAUTHORIZED_ADMIN_EMAIL'
        });
      }

      // Check if admin already exists - if so, prevent duplicate registration
      if (existingUser) {
        console.log('Admin already exists:', email);
        return res.status(409).json({
          success: false,
          message: 'This admin email has already been registered. Please try signing in instead.',
          code: 'EMAIL_ALREADY_EXISTS',
          action: 'redirect_to_login',
          userType: 'admin',
          loginUrl: '/login'
        });
      }

      // Create admin user
      console.log('Creating admin user with data:', {
        name: adminData.name,
        email: email,
        phone: phone || '',
        role: adminData.role
      });
      
      const adminUser = await User.create({
        name: adminData.name,
        email: email,
        password: password,
        phone: phone || '',
        role: adminData.role
      });

      console.log('Admin user saved successfully:', adminUser.id);

      // Generate JWT token
      const token = generateToken(adminUser.id);

      return res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        token,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone,
          isAdmin: true,
          role: adminUser.role,
          createdAt: adminUser.createdAt
        }
      });
    }

    // Check if regular user already exists
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(409).json({
        success: false,
        message: 'You have already been signed up with this email. Try signing in instead.',
        code: 'EMAIL_ALREADY_EXISTS',
        action: 'redirect_to_login',
        userType: 'user',
        loginUrl: '/login'
      });
    }

    // Create new regular user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user'
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
              user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.role === 'admin',
          role: user.role,
          createdAt: user.createdAt
        }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose duplicate key error (just in case)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already been signed up with this email. Try signing in instead.',
        code: 'EMAIL_ALREADY_EXISTS',
        action: 'redirect_to_login'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/v1/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('🔐 Login attempt:', { 
      email, 
      isAdminEmail: User.isAdminEmail(email),
      adminEmails: [
        'emmanuel.evian@autocare.com',
        'ibrahim.mohamud@autocare.com',
        'joel.nganga@autocare.com',
        'patience.karanja@autocare.com',
        'joyrose.kinuthia@autocare.com',
        'admin@autocare.com'
      ]
    });

    // Check if this is an admin login
    if (User.isAdminEmail(email)) {
      console.log('👑 Admin login detected for:', email);
      
      // Verify admin password
      const adminPassword = process.env.ADMIN_PASSWORD || 'autocarpro12k@12k.wwc';
      console.log('🔑 Password check:', { 
        provided: password, 
        expected: adminPassword, 
        match: password === adminPassword 
      });
      
      if (password !== adminPassword) {
        console.log('❌ Admin password mismatch');
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }

      // Get admin data
      const adminData = User.getAdminByEmail(email);
      console.log('📋 Admin data:', adminData);
      
      if (!adminData) {
        console.log('❌ No admin data found for:', email);
        return res.status(401).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Check if admin user exists in database, if not create one
      let adminUser = await User.findOne({ where: { email } });
      console.log('🔍 Existing admin user:', adminUser ? {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role,
        isActive: adminUser.isActive
      } : 'Not found');
      
      if (!adminUser) {
        console.log('➕ Creating new admin user');
        adminUser = await User.create({
          name: adminData.name,
          email: email,
          password: adminPassword,
          role: 'admin' // Explicitly set role to admin
        });
        console.log('✅ Admin user created:', adminUser.id);
      } else {
        // Update existing user to ensure they have admin role
        if (adminUser.role !== 'admin') {
          console.log('🔄 Updating user role from', adminUser.role, 'to admin');
          await adminUser.update({ role: 'admin' });
          adminUser.role = 'admin';
        }
        
        // Ensure user is active
        if (!adminUser.isActive) {
          console.log('🔄 Activating admin user');
          await adminUser.update({ isActive: true });
          adminUser.isActive = true;
        }
      }

      const token = generateToken(adminUser.id);
      console.log('🎉 Admin login successful for:', email, 'Role:', adminUser.role);

      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone,
          isAdmin: true,
          role: 'admin', // Explicitly set to admin
          createdAt: adminUser.createdAt
        }
      });
    }

    // Regular user login
    console.log('👤 Regular user login for:', email);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please register first.',
        code: 'USER_NOT_FOUND',
        action: 'redirect_to_register'
      });
    }

    console.log('🔍 Found user:', {
      id: user.id,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    const token = generateToken(user.id);
    console.log('✅ User login successful:', email, 'Role:', user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.role === 'admin',
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/v1/auth/verify
// @desc    Verify JWT token and get user data
// @access  Private
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret');
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.role === 'admin',
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;