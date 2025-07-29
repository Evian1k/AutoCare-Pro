// backend/routes/payments.js
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// PayPal Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.NODE_ENV === 'production' ? 'live' : 'sandbox';

// PayPal API Base URL
const PAYPAL_BASE_URL = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal Access Token
async function getPayPalAccessToken() {
  try {
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
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
}

// Create PayPal Order
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

// Capture PayPal Payment
router.post('/capture-payment', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
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
      // Here you would typically save the payment record to your database
      res.json({
        success: true,
        data: {
          paymentId: data.purchase_units[0].payments.captures[0].id,
          status: data.status,
          amount: data.purchase_units[0].payments.captures[0].amount.value,
          currency: data.purchase_units[0].payments.captures[0].amount.currency_code,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment capture failed',
      });
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment capture error',
    });
  }
});

// Get PayPal Configuration
router.get('/config', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        clientId: PAYPAL_CLIENT_ID,
        mode: PAYPAL_MODE,
        currency: 'USD',
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load payment configuration',
    });
  }
});

// Mock Payment (for development/testing)
router.post('/mock-payment', async (req, res) => {
  try {
    const { amount, currency = 'USD', description = 'AutoCare Pro Service' } = req.body;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockPaymentId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      data: {
        paymentId: mockPaymentId,
        status: 'COMPLETED',
        amount: amount,
        currency: currency,
        description: description,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Mock payment failed',
    });
  }
});

export default router;
