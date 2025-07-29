const express = require('express');
const router = express.Router();

// GET /api/v1/users/profile
// Get user profile
router.get('/profile', (req, res) => {
  try {
    const user = req.user.toPublicJSON();
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

// PUT /api/v1/users/profile
// Update user profile
router.put('/profile', (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = req.user;
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    
    user.save();
    
    res.json({
      success: true,
      data: user.toPublicJSON(),
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

module.exports = router;