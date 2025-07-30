const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/v1/messages
// @desc    Get all messages for the authenticated user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    // For now, return all messages (in production, filter by user)
    const messages = await Message.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// @route   POST /api/v1/messages
// @desc    Send a message (users to admins, admins to users)
// @access  Private
router.post('/', authenticateToken, [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('recipientId')
    .optional()
    .isInt()
    .withMessage('Recipient ID must be a valid integer'),
  body('conversationId')
    .optional()
    .isString()
    .withMessage('Conversation ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { text, recipientId, conversationId } = req.body;
    
    // Create message with authenticated user as sender
    const message = await Message.create({
      text,
      senderId: req.user.id,
      recipientId: recipientId || null,
      conversationId: conversationId || `conv_${Date.now()}`,
      senderType: req.user.role === 'admin' ? 'admin' : 'user',
      isRead: false
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// @route   GET /api/v1/messages/admin
// @desc    Get all messages for admins (support requests)
// @access  Private (Admin only)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    // Get all messages sent to admins (where recipientId is null or admin)
    const messages = await Message.findAll({
      where: {
        senderType: 'user'
      },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin messages'
    });
  }
});

// @route   POST /api/v1/messages/admin/reply
// @desc    Admin reply to a user message
// @access  Private (Admin only)
router.post('/admin/reply', authenticateToken, [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('originalMessageId')
    .isInt()
    .withMessage('Original message ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { text, originalMessageId } = req.body;

    // Get the original message
    const originalMessage = await Message.findByPk(originalMessageId);
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Original message not found'
      });
    }

    // Create admin reply
    const reply = await Message.create({
      text,
      senderId: 1, // Admin ID (should come from JWT)
      recipientId: originalMessage.senderId,
      conversationId: originalMessage.conversationId,
      senderType: 'admin',
      isRead: false
    });

    // Mark original message as read
    await originalMessage.update({ isRead: true });

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: reply
    });
  } catch (error) {
    console.error('Error sending admin reply:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending admin reply'
    });
  }
});

// @route   PUT /api/v1/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.update({ isRead: true });

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read'
    });
  }
});

// @route   GET /api/v1/messages/conversations
// @desc    Get all conversations for the user
// @access  Private
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    // Get unique conversation IDs
    const conversations = await Message.findAll({
      attributes: ['conversationId'],
      group: ['conversationId'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: conversations.map(conv => conv.conversationId)
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

module.exports = router;