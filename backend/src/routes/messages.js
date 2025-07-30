const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const router = express.Router();

// Helper function to format date properly
const formatMessageDate = (date) => {
  if (!date) return 'Invalid Date';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toISOString();
  } catch (error) {
    return 'Invalid Date';
  }
};

// Helper function to add auto-reply for user messages
const addAutoReply = async (originalMessage) => {
  try {
    const autoReply = await Message.create({
      text: "Thank you for your message. We will help you with your service booking.",
      senderId: 1, // Admin ID
      recipientId: originalMessage.senderId,
      conversationId: originalMessage.conversationId,
      senderType: 'admin',
      isRead: false,
      isAutoReply: true
    });
    return autoReply;
  } catch (error) {
    console.error('Auto-reply creation error:', error);
    return null;
  }
};

// @route   GET /api/v1/messages
// @desc    Get all messages for the authenticated user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    let messages;
    
    if (req.user.role === 'admin') {
      // Admin: Get all messages from users
      messages = await Message.findAll({
        where: {
          senderType: 'user'
        },
        order: [['createdAt', 'DESC']],
        limit: 100
      });
    } else {
      // User: Get their messages and admin replies
      messages = await Message.findAll({
        where: {
          [sequelize.Op.or]: [
            { senderId: req.user.id },
            { recipientId: req.user.id }
          ]
        },
        order: [['createdAt', 'DESC']],
        limit: 100
      });
    }

    // Format dates properly
    const formattedMessages = messages.map(message => ({
      ...message.toJSON(),
      createdAt: formatMessageDate(message.createdAt),
      updatedAt: formatMessageDate(message.updatedAt)
    }));

    res.json({
      success: true,
      data: formattedMessages
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
      conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderType: req.user.role === 'admin' ? 'admin' : 'user',
      isRead: false
    });

    // If user sends message, add auto-reply
    let autoReply = null;
    if (req.user.role !== 'admin') {
      autoReply = await addAutoReply(message);
    }

    const responseData = {
      ...message.toJSON(),
      createdAt: formatMessageDate(message.createdAt),
      updatedAt: formatMessageDate(message.updatedAt)
    };

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: responseData,
      autoReply: autoReply ? {
        ...autoReply.toJSON(),
        createdAt: formatMessageDate(autoReply.createdAt),
        updatedAt: formatMessageDate(autoReply.updatedAt)
      } : null
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get all messages sent to admins (where recipientId is null or admin)
    const messages = await Message.findAll({
      where: {
        senderType: 'user'
      },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    // Format dates properly
    const formattedMessages = messages.map(message => ({
      ...message.toJSON(),
      createdAt: formatMessageDate(message.createdAt),
      updatedAt: formatMessageDate(message.updatedAt)
    }));

    res.json({
      success: true,
      data: formattedMessages
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

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
      senderId: req.user.id,
      recipientId: originalMessage.senderId,
      conversationId: originalMessage.conversationId,
      senderType: 'admin',
      isRead: false
    });

    // Mark original message as read
    await originalMessage.update({ isRead: true });

    const responseData = {
      ...reply.toJSON(),
      createdAt: formatMessageDate(reply.createdAt),
      updatedAt: formatMessageDate(reply.updatedAt)
    };

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: responseData
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
    let conversations;
    
    if (req.user.role === 'admin') {
      // Admin: Get all conversations with users
      conversations = await Message.findAll({
        attributes: ['conversationId', 'senderId', 'createdAt'],
        where: {
          senderType: 'user'
        },
        group: ['conversationId'],
        order: [['createdAt', 'DESC']]
      });
    } else {
      // User: Get their conversations
      conversations = await Message.findAll({
        attributes: ['conversationId'],
        where: {
          [sequelize.Op.or]: [
            { senderId: req.user.id },
            { recipientId: req.user.id }
          ]
        },
        group: ['conversationId'],
        order: [['createdAt', 'DESC']]
      });
    }

    res.json({
      success: true,
      data: conversations.map(conv => ({
        ...conv.toJSON(),
        createdAt: formatMessageDate(conv.createdAt)
      }))
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

// @route   GET /api/v1/messages/conversation/:conversationId
// @desc    Get messages for a specific conversation
// @access  Private
router.get('/conversation/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']]
    });

    // Format dates properly
    const formattedMessages = messages.map(message => ({
      ...message.toJSON(),
      createdAt: formatMessageDate(message.createdAt),
      updatedAt: formatMessageDate(message.updatedAt)
    }));

    res.json({
      success: true,
      data: formattedMessages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation'
    });
  }
});

module.exports = router;