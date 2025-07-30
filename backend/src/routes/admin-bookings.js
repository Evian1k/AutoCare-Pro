const express = require('express');
const router = express.Router();
const { Booking, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// GET /api/v1/admin/bookings - Get all bookings for admin review
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    const offset = (page - 1) * limit;
    
    const bookings = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.json({
      success: true,
      data: {
        bookings: bookings.rows,
        total: bookings.count,
        page: parseInt(page),
        totalPages: Math.ceil(bookings.count / limit)
      }
    });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings'
    });
  }
});

// GET /api/v1/admin/bookings/pending - Get pending bookings only
router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingBookings = await Booking.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    res.json({
      success: true,
      data: pendingBookings
    });
  } catch (error) {
    console.error('Get pending bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending bookings'
    });
  }
});

// PUT /api/v1/admin/bookings/:id/approve - Approve a booking
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, estimatedCompletion, assignedTruck } = req.body;
    
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    await booking.update({
      status: 'approved',
      adminNotes: adminNotes || booking.adminNotes,
      estimatedCompletion: estimatedCompletion || booking.estimatedCompletion,
      assignedTruck: assignedTruck || booking.assignedTruck,
      approvedBy: req.user.id,
      approvedAt: new Date()
    });
    
    // Emit to user room for real-time updates
    req.app.get('io').emit(`booking-updated-${booking.userId}`, {
      booking,
      action: 'approved',
      admin: req.user.toPublicJSON()
    });
    
    // Emit to all admins
    req.app.get('io').emit('booking-approved', {
      booking,
      admin: req.user.toPublicJSON()
    });
    
    res.json({
      success: true,
      data: booking,
      message: 'Booking approved successfully'
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve booking'
    });
  }
});

// PUT /api/v1/admin/bookings/:id/reject - Reject a booking
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, rejectionReason } = req.body;
    
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    await booking.update({
      status: 'rejected',
      adminNotes: adminNotes || booking.adminNotes,
      rejectionReason: rejectionReason,
      rejectedBy: req.user.id,
      rejectedAt: new Date()
    });
    
    // Emit to user room for real-time updates
    req.app.get('io').emit(`booking-updated-${booking.userId}`, {
      booking,
      action: 'rejected',
      admin: req.user.toPublicJSON()
    });
    
    // Emit to all admins
    req.app.get('io').emit('booking-rejected', {
      booking,
      admin: req.user.toPublicJSON()
    });
    
    res.json({
      success: true,
      data: booking,
      message: 'Booking rejected successfully'
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject booking'
    });
  }
});

// PUT /api/v1/admin/bookings/:id/complete - Mark booking as completed
router.put('/:id/complete', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, completionNotes } = req.body;
    
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    await booking.update({
      status: 'completed',
      adminNotes: adminNotes || booking.adminNotes,
      completionNotes: completionNotes,
      completedBy: req.user.id,
      completedAt: new Date()
    });
    
    // Emit to user room for real-time updates
    req.app.get('io').emit(`booking-updated-${booking.userId}`, {
      booking,
      action: 'completed',
      admin: req.user.toPublicJSON()
    });
    
    // Emit to all admins
    req.app.get('io').emit('booking-completed', {
      booking,
      admin: req.user.toPublicJSON()
    });
    
    res.json({
      success: true,
      data: booking,
      message: 'Booking marked as completed'
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete booking'
    });
  }
});

// GET /api/v1/admin/bookings/stats - Get booking statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalBookings = await Booking.count();
    const pendingBookings = await Booking.count({ where: { status: 'pending' } });
    const approvedBookings = await Booking.count({ where: { status: 'approved' } });
    const completedBookings = await Booking.count({ where: { status: 'completed' } });
    const rejectedBookings = await Booking.count({ where: { status: 'rejected' } });
    
    res.json({
      success: true,
      data: {
        total: totalBookings,
        pending: pendingBookings,
        approved: approvedBookings,
        completed: completedBookings,
        rejected: rejectedBookings
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking statistics'
    });
  }
});

module.exports = router; 