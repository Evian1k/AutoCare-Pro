const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const BankAccount = require('../models/BankAccount');
const { authenticateToken } = require('../middleware/auth');

// GET /api/v1/bank-accounts
// Get all bank accounts (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const bankAccounts = await BankAccount.findAll({
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: bankAccounts
    });
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank accounts'
    });
  }
});

// POST /api/v1/bank-accounts
// Create new bank account (admin only)
router.post('/', authenticateToken, [
  body('accountName').isString().isLength({ min: 2, max: 100 }).withMessage('Account name must be 2-100 characters'),
  body('accountNumber').isString().isLength({ min: 5, max: 50 }).withMessage('Account number must be 5-50 characters'),
  body('bankName').isString().isLength({ min: 2, max: 100 }).withMessage('Bank name must be 2-100 characters'),
  body('bankCode').isString().isLength({ min: 2, max: 20 }).withMessage('Bank code must be 2-20 characters'),
  body('accountType').isIn(['savings', 'current', 'business']).withMessage('Invalid account type'),
  body('isDefault').optional().isBoolean()
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

    const { accountName, accountNumber, bankName, bankCode, accountType, isDefault, adminNotes } = req.body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await BankAccount.update(
        { isDefault: false },
        { where: { isDefault: true } }
      );
    }

    const bankAccount = await BankAccount.create({
      accountName,
      accountNumber,
      bankName,
      bankCode,
      accountType,
      isDefault: isDefault || false,
      adminNotes
    });

    res.status(201).json({
      success: true,
      message: 'Bank account created successfully',
      data: bankAccount
    });
  } catch (error) {
    console.error('Create bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bank account'
    });
  }
});

// PUT /api/v1/bank-accounts/:id
// Update bank account (admin only)
router.put('/:id', authenticateToken, [
  body('accountName').optional().isString().isLength({ min: 2, max: 100 }),
  body('accountNumber').optional().isString().isLength({ min: 5, max: 50 }),
  body('bankName').optional().isString().isLength({ min: 2, max: 100 }),
  body('bankCode').optional().isString().isLength({ min: 2, max: 20 }),
  body('accountType').optional().isIn(['savings', 'current', 'business']),
  body('isActive').optional().isBoolean(),
  body('isDefault').optional().isBoolean()
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

    const bankAccountId = req.params.id;
    const updateData = req.body;

    const bankAccount = await BankAccount.findByPk(bankAccountId);
    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await BankAccount.update(
        { isDefault: false },
        { where: { isDefault: true } }
      );
    }

    await bankAccount.update(updateData);

    res.json({
      success: true,
      message: 'Bank account updated successfully',
      data: bankAccount
    });
  } catch (error) {
    console.error('Update bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bank account'
    });
  }
});

// DELETE /api/v1/bank-accounts/:id
// Delete bank account (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const bankAccountId = req.params.id;

    const bankAccount = await BankAccount.findByPk(bankAccountId);
    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Don't allow deletion of default account
    if (bankAccount.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default bank account'
      });
    }

    await bankAccount.destroy();

    res.json({
      success: true,
      message: 'Bank account deleted successfully'
    });
  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bank account'
    });
  }
});

// GET /api/v1/bank-accounts/default
// Get default bank account
router.get('/default', async (req, res) => {
  try {
    const defaultAccount = await BankAccount.findOne({
      where: { isDefault: true, isActive: true }
    });

    if (!defaultAccount) {
      return res.status(404).json({
        success: false,
        message: 'No default bank account configured'
      });
    }

    res.json({
      success: true,
      data: defaultAccount
    });
  } catch (error) {
    console.error('Get default bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default bank account'
    });
  }
});

module.exports = router; 