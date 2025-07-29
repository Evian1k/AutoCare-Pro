import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, DollarSign, CreditCardIcon, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

const PaymentForm = ({ onPaymentSuccess, onPaymentError }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mock'); // 'paypal', 'mock'
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paypalConfig, setPaypalConfig] = useState(null);

  useEffect(() => {
    fetchPaymentConfig();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const response = await apiService.request('/payments/config');
      if (response.success) {
        setPaypalConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load payment config:', error);
    }
  };

  const handleMockPayment = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.request('/payments/mock-payment', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          description: description || 'AutoCare Pro Service Payment'
        })
      });

      if (response.success) {
        setSuccess('Payment completed successfully!');
        onPaymentSuccess && onPaymentSuccess(response.data);
        
        // Reset form after success
        setTimeout(() => {
          setAmount('');
          setDescription('');
          setSuccess('');
        }, 3000);
      } else {
        setError(response.message || 'Payment failed');
        onPaymentError && onPaymentError(response.message);
      }
    } catch (error) {
      setError('Payment processing failed. Please try again.');
      onPaymentError && onPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.request('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          description: description || 'AutoCare Pro Service Payment'
        })
      });

      if (response.success && response.data.approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = response.data.approvalUrl;
      } else {
        setError(response.message || 'Failed to create PayPal order');
        onPaymentError && onPaymentError(response.message);
      }
    } catch (error) {
      setError('PayPal payment failed. Please try again.');
      onPaymentError && onPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (paymentMethod === 'paypal') {
      await handlePayPalPayment();
    } else {
      await handleMockPayment();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment
        </CardTitle>
        <CardDescription>
          Choose your payment method for AutoCare Pro services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                step="0.01"
                min="0.01"
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency} disabled={isProcessing}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Service description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="mock"
                  name="paymentMethod"
                  value="mock"
                  checked={paymentMethod === 'mock'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isProcessing}
                />
                <Label htmlFor="mock" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  Mock Payment (Development)
                </Label>
              </div>
              
              {paypalConfig && (
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={isProcessing}
                  />
                  <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                    <CreditCardIcon className="h-4 w-4 text-blue-600" />
                    PayPal
                  </Label>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              paymentMethod === 'paypal' ? 'Pay with PayPal' : 'Process Mock Payment'
            )}
          </Button>

          {paymentMethod === 'mock' && (
            <p className="text-xs text-gray-500 text-center">
              Mock payments are for development/testing only. No real charges will be made.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;