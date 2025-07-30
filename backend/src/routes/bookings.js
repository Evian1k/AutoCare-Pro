const express = require('express');
const router = express.Router();
const { Booking } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// GET /api/v1/bookings - Get all bookings for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings'
    });
  }
});

// POST /api/v1/bookings - Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { serviceType, description, location, vehicleInfo, urgency } = req.body;
    
    const booking = await Booking.create({
      userId: req.user.id,
      serviceType,
      description,
      location,
      vehicleInfo,
      urgency: urgency || 'normal',
      status: 'pending',
      amount: calculateServiceAmount(serviceType)
    });
    
    // Emit to admin room for real-time updates
    req.app.get('io').emit('new-booking', {
      booking,
      user: req.user.toPublicJSON()
    });
    
    res.json({
      success: true,
      data: booking,
      message: 'Service request created successfully'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// PUT /api/v1/bookings/:id - Update a booking
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceType, description, location, vehicleInfo, urgency } = req.body;
    
    const booking = await Booking.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    await booking.update({
      serviceType,
      description,
      location,
      vehicleInfo,
      urgency,
      amount: calculateServiceAmount(serviceType)
    });
    
    res.json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    });
  }
});

// DELETE /api/v1/bookings/:id - Cancel a booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    await booking.update({ status: 'cancelled' });
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

// GET /api/v1/bookings/:id - Get a specific booking
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking'
    });
  }
});

// Helper function to calculate service amount
function calculateServiceAmount(serviceType) {
  const prices = {
    'oil_change': 2500,
    'tire_change': 3500,
    'battery_replacement': 4500,
    'brake_service': 5500,
    'engine_repair': 15000,
    'general_maintenance': 3000,
    'emergency_service': 8000
  };
  
  return prices[serviceType] || 3000;
}

module.exports = router;