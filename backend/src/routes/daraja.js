const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Payment = require('../models/Payment');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');

// Daraja API configuration
const DARAJA_CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY;
const DARAJA_CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET;
const DARAJA_BASE_URL = process.env.DARAJA_BASE_URL || 'https://sandbox.safaricom.co.ke';
const DARAJA_PASSKEY = process.env.DARAJA_PASSKEY;
const DARAJA_SHORTCODE = process.env.DARAJA_SHORTCODE;

// Get Daraja access token
const getDarajaAccessToken = async () => {
  try {
    const auth = Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Daraja access token error:', error);
    throw error;
  }
};

// Generate Daraja API password
const generatePassword = (shortcode, passkey, timestamp) => {
  const str = shortcode + passkey + timestamp;
  return Buffer.from(str).toString('base64');
};

// POST /api/v1/daraja/initiate-payment
// Initiate M-Pesa STK Push
router.post('/initiate-payment', authenticateToken, [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('phoneNumber').isMobilePhone('en-KE').withMessage('Valid Kenyan phone number required'),
  body('description').optional().isString().isLength({ max: 100 })
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
    
    // Format phone number for M-Pesa (254XXXXXXXXX)
    const formattedPhone = phoneNumber.startsWith('0') 
      ? '254' + phoneNumber.substring(1) 
      : phoneNumber.startsWith('254') 
        ? phoneNumber 
        : '254' + phoneNumber;

    const accessToken = await getDarajaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = generatePassword(DARAJA_SHORTCODE, DARAJA_PASSKEY, timestamp);

    const stkPushData = {
      BusinessShortCode: DARAJA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: DARAJA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.BACKEND_URL}/api/v1/daraja/callback`,
      AccountReference: `AutoCare_${Date.now()}`,
      TransactionDesc: description || 'AutoCare Pro Service Payment'
    };

    const response = await axios.post(
      `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      stkPushData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.ResultCode === '0') {
      // Create payment record
      const payment = await Payment.create({
        userId: req.user.id,
        amount: amount,
        currency: 'KES',
        paymentMethod: 'mpesa',
        phoneNumber: phoneNumber,
        description: description || 'AutoCare Pro Service Payment',
        status: 'pending',
        transactionId: response.data.CheckoutRequestID,
        metadata: {
          merchantRequestID: response.data.MerchantRequestID,
          checkoutRequestID: response.data.CheckoutRequestID
        }
      });

      res.json({
        success: true,
        message: 'Payment initiated successfully. Please check your phone for the M-Pesa prompt.',
        data: {
          paymentId: payment.id,
          checkoutRequestID: response.data.CheckoutRequestID,
          amount: amount,
          phoneNumber: phoneNumber
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to initiate payment',
        error: response.data.ResultDesc
      });
    }
  } catch (error) {
    console.error('Daraja payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed'
    });
  }
});

// POST /api/v1/daraja/callback
// Handle M-Pesa callback
router.post('/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const stkCallback = Body.stkCallback;

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const checkoutRequestID = stkCallback.CheckoutRequestID;
      const payment = await Payment.findOne({
        where: { transactionId: checkoutRequestID }
      });

      if (payment) {
        await payment.update({
          status: 'completed',
          completedAt: new Date(),
          metadata: {
            ...payment.metadata,
            mpesaReceiptNumber: stkCallback.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber')?.Value,
            transactionDate: stkCallback.CallbackMetadata.Item.find(item => item.Name === 'TransactionDate')?.Value
          }
        });

        // Send notification to user
        // You can implement WebSocket notification here
      }
    } else {
      // Payment failed
      const checkoutRequestID = stkCallback.CheckoutRequestID;
      const payment = await Payment.findOne({
        where: { transactionId: checkoutRequestID }
      });

      if (payment) {
        await payment.update({
          status: 'failed',
          metadata: {
            ...payment.metadata,
            error: stkCallback.ResultDesc
          }
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Daraja callback error:', error);
    res.status(500).json({ success: false });
  }
});

// GET /api/v1/daraja/payment-status/:checkoutRequestID
// Check payment status
router.get('/payment-status/:checkoutRequestID', authenticateToken, async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;
    
    const payment = await Payment.findOne({
      where: { transactionId: checkoutRequestID }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount,
        phoneNumber: payment.phoneNumber,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt
      }
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
});

// POST /api/v1/daraja/send-prompt
// Send payment prompt to user's phone
router.post('/send-prompt', authenticateToken, [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('phoneNumber').isMobilePhone('en-KE').withMessage('Valid Kenyan phone number required'),
  body('serviceType').isString().withMessage('Service type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, phoneNumber, serviceType } = req.body;
    
    // Format phone number
    const formattedPhone = phoneNumber.startsWith('0') 
      ? '254' + phoneNumber.substring(1) 
      : phoneNumber.startsWith('254') 
        ? phoneNumber 
        : '254' + phoneNumber;

    // Send SMS prompt (you can integrate with SMS service like Twilio)
    const message = `AutoCare Pro: You have a pending payment of KES ${amount} for ${serviceType}. Please complete the payment to proceed with your service request.`;
    
    // For now, we'll just return success
    // In production, integrate with SMS service
    res.json({
      success: true,
      message: 'Payment prompt sent successfully',
      data: {
        phoneNumber: formattedPhone,
        amount: amount,
        serviceType: serviceType,
        message: message
      }
    });
  } catch (error) {
    console.error('Send prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment prompt'
    });
  }
});

module.exports = router; 