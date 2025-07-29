const User = require('../models/User');

// Check email availability for registration
const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    const isAdminEmail = User.isAdminEmail(email);
    
    if (existingUser) {
      return res.json({
        success: true,
        available: false,
        message: 'Email is already registered',
        isAdminEmail
      });
    }

    return res.json({
      success: true,
      available: true,
      message: 'Email is available for registration',
      isAdminEmail
    });
  } catch (error) {
    console.error('Email availability check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during email check'
    });
  }
};

// Check for duplicate email during registration
const checkDuplicateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    const isAdminEmail = User.isAdminEmail(email);
    
    if (existingUser && !isAdminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    next();
  } catch (error) {
    console.error('Duplicate email check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during email validation'
    });
  }
};

module.exports = {
  checkEmailAvailability,
  checkDuplicateEmail
};