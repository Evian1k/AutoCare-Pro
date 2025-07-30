const express = require('express');
const router = express.Router();
const { Message } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// GET /api/v1/messages - Get all messages for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { 
        [require('sequelize').Op.or]: [
          { userId: req.user.id },
          { senderId: req.user.id }
        ]
      },
      order: [['createdAt', 'DESC']],
      include: [
        { model: require('../models/User'), as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: require('../models/User'), as: 'receiver', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
});

// POST /api/v1/messages - Send a message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;
    
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: receiverId || 1, // Default to admin
      content,
      type,
      read: false
    });
    
    // Emit to admin room for real-time updates
    req.app.get('io').emit('new-message', {
      message,
      sender: req.user.toPublicJSON()
    });
    
    res.json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// PUT /api/v1/messages/:id/read - Mark message as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findOne({
      where: { 
        id,
        [require('sequelize').Op.or]: [
          { userId: req.user.id },
          { senderId: req.user.id }
        ]
      }
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await message.update({ read: true });
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// GET /api/v1/messages/unread - Get unread message count
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const count = await Message.count({
      where: { 
        receiverId: req.user.id,
        read: false
      }
    });
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

module.exports = router;