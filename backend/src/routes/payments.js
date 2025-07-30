const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Payment = require('../models/Payment');
const BankAccount = require('../models/BankAccount');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_BASE_URL = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('PayPal access token error:', error);
    throw error;
  }
};

// GET /api/v1/payments/config
// Get payment configuration for frontend
router.get('/config', async (req, res) => {
  try {
    // Get default bank account for admin
    const defaultBankAccount = await BankAccount.findOne({
      where: { isDefault: true, isActive: true }
    });

    res.json({
      success: true,
      data: {
        paypal: {
          clientId: PAYPAL_CLIENT_ID,
          mode: PAYPAL_MODE
        },
        bankAccount: defaultBankAccount ? {
          accountName: defaultBankAccount.accountName,
          accountNumber: defaultBankAccount.accountNumber,
          bankName: defaultBankAccount.bankName,
          bankCode: defaultBankAccount.bankCode
        } : null
      }
    });
  } catch (error) {
    console.error('Payment config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load payment configuration'
    });
  }
});

// POST /api/v1/payments/mobile-money
// Process mobile money payment
router.post('/mobile-money', authenticateToken, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
  body('description').optional().isString().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, phoneNumber, description } = req.body;
    
    // Get default bank account
    const defaultBankAccount = await BankAccount.findOne({
      where: { isDefault: true, isActive: true }
    });

    if (!defaultBankAccount) {
      return res.status(400).json({
        success: false,
        message: 'No default bank account configured'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      amount: amount,
      currency: 'USD',
      paymentMethod: 'mobile_money',
      phoneNumber: phoneNumber,
      description: description || 'AutoCare Pro Service Payment',
      adminBankAccount: defaultBankAccount.accountNumber,
      adminBankName: defaultBankAccount.bankName,
      adminBankCode: defaultBankAccount.bankCode,
      status: 'pending',
      transactionId: `MM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    res.json({
      success: true,
      message: `Payment initiated. Please send $${amount} to ${phoneNumber} and upload proof.`,
      data: {
        paymentId: payment.id,
        transactionId: payment.transactionId,
        amount: amount,
        phoneNumber: phoneNumber,
        bankAccount: {
          accountName: defaultBankAccount.accountName,
          accountNumber: defaultBankAccount.accountNumber,
          bankName: defaultBankAccount.bankName,
          bankCode: defaultBankAccount.bankCode
        }
      }
    });
  } catch (error) {
    console.error('Mobile money payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed'
    });
  }
});

// POST /api/v1/payments/bank-transfer
// Process bank transfer payment
router.post('/bank-transfer', authenticateToken, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('bankAccount').optional().isString(),
  body('description').optional().isString().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, bankAccount, description } = req.body;
    
    // Get default bank account
    const defaultBankAccount = await BankAccount.findOne({
      where: { isDefault: true, isActive: true }
    });

    if (!defaultBankAccount) {
      return res.status(400).json({
        success: false,
        message: 'No default bank account configured'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      amount: amount,
      currency: 'USD',
      paymentMethod: 'bank_transfer',
      bankAccount: bankAccount,
      description: description || 'AutoCare Pro Service Payment',
      adminBankAccount: defaultBankAccount.accountNumber,
      adminBankName: defaultBankAccount.bankName,
      adminBankCode: defaultBankAccount.bankCode,
      status: 'pending',
      transactionId: `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    res.json({
      success: true,
      message: `Bank transfer initiated. Please transfer $${amount} to the provided account.`,
      data: {
        paymentId: payment.id,
        transactionId: payment.transactionId,
        amount: amount,
        bankAccount: {
          accountName: defaultBankAccount.accountName,
          accountNumber: defaultBankAccount.accountNumber,
          bankName: defaultBankAccount.bankName,
          bankCode: defaultBankAccount.bankCode
        }
      }
    });
  } catch (error) {
    console.error('Bank transfer payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed'
    });
  }
});

// POST /api/v1/payments/upload-proof
// Upload payment proof
router.post('/upload-proof', authenticateToken, [
  body('paymentId').isInt().withMessage('Valid payment ID required'),
  body('proofUrl').isURL().withMessage('Valid proof URL required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { paymentId, proofUrl } = req.body;

    const payment = await Payment.findOne({
      where: { id: paymentId, userId: req.user.id }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.update({
      paymentProof: proofUrl,
      status: 'pending' // Admin will review and approve
    });

    res.json({
      success: true,
      message: 'Payment proof uploaded successfully. Admin will review and approve.',
      data: payment
    });
  } catch (error) {
    console.error('Upload proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload proof'
    });
  }
});

// GET /api/v1/payments/user-payments
// Get user's payment history
router.get('/user-payments', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// GET /api/v1/payments/admin/all
// Get all payments for admin review
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const payments = await Payment.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get admin payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// PUT /api/v1/payments/admin/approve/:id
// Approve payment by admin
router.put('/admin/approve/:id', authenticateToken, [
  body('adminNotes').optional().isString()
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { adminNotes } = req.body;
    const paymentId = req.params.id;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.update({
      status: 'completed',
      adminNotes: adminNotes,
      completedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Payment approved successfully',
      data: payment
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve payment'
    });
  }
});

// POST /api/v1/payments/create-order
// Create PayPal order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'USD', description = 'AutoCare Pro Service' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount provided'
      });
    }

    const accessToken = await getPayPalAccessToken();
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toString(),
          },
          description: description,
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
      },
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    
    if (data.id) {
      res.json({
        success: true,
        data: {
          orderId: data.id,
          approvalUrl: data.links.find(link => link.rel === 'approve').href,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create PayPal order',
      });
    }
  } catch (error) {
    console.error('PayPal order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment service error',
    });
  }
});

// POST /api/v1/payments/capture-payment
// Capture PayPal payment
router.post('/capture-payment', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.status === 'COMPLETED') {
      res.json({
        success: true,
        data: {
          paymentId: data.purchase_units[0].payments.captures[0].id,
          status: data.status,
          amount: data.purchase_units[0].payments.captures[0].amount.value,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment capture failed',
      });
    }
  } catch (error) {
    console.error('PayPal payment capture error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment capture error',
    });
  }
});

// POST /api/v1/payments/mock-payment
// Mock payment for testing
router.post('/mock-payment', async (req, res) => {
  try {
    const { amount, currency = 'USD', description = 'AutoCare Pro Service' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount provided'
      });
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      data: {
        paymentId: `mock_${Date.now()}`,
        status: 'COMPLETED',
        amount: amount,
        currency: currency,
        description: description,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Mock payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Mock payment error',
    });
  }
});

module.exports = router;
