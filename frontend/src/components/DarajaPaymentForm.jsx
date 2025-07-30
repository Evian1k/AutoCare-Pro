import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Loader2, 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Phone,
  Smartphone,
  Clock,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DarajaPaymentForm = ({ onPaymentSuccess, onPaymentError, serviceType = 'AutoCare Service' }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkoutRequestID, setCheckoutRequestID] = useState(null);

  // Auto-fill phone number from user profile
  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  const validateForm = () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (!phoneNumber) {
      setError('Please enter your phone number');
      return false;
    }

    // Validate Kenyan phone number format
    const phoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid Kenyan phone number');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setError('');
    setSuccess('');
    setPaymentStatus('initiating');

    try {
      const response = await apiService.request('/daraja/initiate-payment', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          phoneNumber: phoneNumber,
          description: description || `${serviceType} Payment`
        })
      });

      if (response.success) {
        setCheckoutRequestID(response.data.checkoutRequestID);
        setSuccess('Payment initiated! Please check your phone for the M-Pesa prompt.');
        setPaymentStatus('pending');
        onPaymentSuccess && onPaymentSuccess(response.data);
        
        // Start polling for payment status
        pollPaymentStatus(response.data.checkoutRequestID);
      } else {
        setError(response.message || 'Payment failed');
        setPaymentStatus('failed');
        onPaymentError && onPaymentError(response.message);
      }
    } catch (error) {
      setError('Payment processing failed. Please try again.');
      setPaymentStatus('failed');
      onPaymentError && onPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (requestID) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await apiService.request(`/daraja/payment-status/${requestID}`);
        
        if (response.success) {
          const status = response.data.status;
          
          if (status === 'completed') {
            setPaymentStatus('completed');
            setSuccess('Payment completed successfully!');
            onPaymentSuccess && onPaymentSuccess(response.data);
            return;
          } else if (status === 'failed') {
            setPaymentStatus('failed');
            setError('Payment failed. Please try again.');
            onPaymentError && onPaymentError('Payment failed');
            return;
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          setPaymentStatus('timeout');
          setError('Payment timeout. Please check your phone and try again.');
        }
      } catch (error) {
        console.error('Payment status check error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        }
      }
    };

    setTimeout(checkStatus, 10000); // Start checking after 10 seconds
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'initiating':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'timeout':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'initiating':
        return <Badge className="bg-blue-100 text-blue-800">Initiating</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'timeout':
        return <Badge className="bg-orange-100 text-orange-800">Timeout</Badge>;
      default:
        return null;
    }
  };

  const formatPhoneNumber = (phone) => {
    // Format phone number for display
    if (phone.startsWith('254')) {
      return `+254 ${phone.substring(3, 6)} ${phone.substring(6, 9)} ${phone.substring(9)}`;
    } else if (phone.startsWith('0')) {
      return `+254 ${phone.substring(1, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}`;
    }
    return phone;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="payment-form neon-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <Smartphone className="h-6 w-6" />
            M-Pesa Payment
          </CardTitle>
          <CardDescription className="text-gray-300">
            Complete your payment using M-Pesa mobile money
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="fade-in">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 fade-in">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {paymentStatus && (
            <div className="flex items-center gap-3 p-4 bg-black/20 rounded-lg">
              {getStatusIcon()}
              <div className="flex-1">
                <p className="font-medium text-white">
                  {paymentStatus === 'initiating' && 'Initiating payment...'}
                  {paymentStatus === 'pending' && 'Waiting for payment confirmation...'}
                  {paymentStatus === 'completed' && 'Payment completed successfully!'}
                  {paymentStatus === 'failed' && 'Payment failed'}
                  {paymentStatus === 'timeout' && 'Payment timeout'}
                </p>
                <p className="text-sm text-gray-400">
                  {paymentStatus === 'pending' && 'Please check your phone and enter M-Pesa PIN'}
                  {paymentStatus === 'completed' && 'Your service request has been processed'}
                </p>
              </div>
              {getStatusBadge()}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-white">Amount (KES)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 form-input"
                  step="0.01"
                  min="1"
                  disabled={isProcessing}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="07XX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 form-input"
                  disabled={isProcessing}
                  required
                />
              </div>
              {phoneNumber && (
                <p className="text-sm text-gray-400 mt-1">
                  Formatted: {formatPhoneNumber(phoneNumber)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Service description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                disabled={isProcessing}
              />
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-blue-300">Payment Instructions</span>
              </div>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Ensure you have sufficient M-Pesa balance</li>
                <li>• You will receive an M-Pesa prompt on your phone</li>
                <li>• Enter your M-Pesa PIN to complete payment</li>
                <li>• Payment will be processed automatically</li>
              </ul>
            </div>

            <Button
              onClick={handlePayment}
              className="w-full btn-animate"
              disabled={isProcessing || paymentStatus === 'pending'}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Pay with M-Pesa
                </>
              )}
            </Button>

            {checkoutRequestID && (
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Transaction ID: {checkoutRequestID}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DarajaPaymentForm; 