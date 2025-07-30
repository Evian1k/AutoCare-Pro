import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, DollarSign, CreditCardIcon, CheckCircle, Phone, Building, Upload } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PaymentForm = ({ onPaymentSuccess, onPaymentError }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paypalConfig, setPaypalConfig] = useState(null);
  const [bankConfig, setBankConfig] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    fetchPaymentConfig();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const response = await apiService.request('/payments/config');
      if (response.success) {
        setPaypalConfig(response.data.paypal);
        setBankConfig(response.data.bankAccount);
      }
    } catch (error) {
      console.error('Failed to load payment config:', error);
    }
  };

  const validateForm = () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (paymentMethod === 'mobile_money' && !phoneNumber) {
      setError('Please enter your phone number');
      return false;
    }

    if (paymentMethod === 'bank_transfer' && !bankAccount) {
      setError('Please enter your bank account number');
      return false;
    }

    return true;
  };

  const handleMobileMoneyPayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.request('/payments/mobile-money', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          phoneNumber: phoneNumber,
          description: description || 'AutoCare Pro Service Payment'
        })
      });

      if (response.success) {
        setPaymentId(response.data.paymentId);
        setSuccess(`Payment initiated! Please send $${amount} to ${phoneNumber} and upload proof.`);
        onPaymentSuccess && onPaymentSuccess(response.data);
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

  const handleBankTransferPayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.request('/payments/bank-transfer', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          bankAccount: bankAccount,
          description: description || 'AutoCare Pro Service Payment'
        })
      });

      if (response.success) {
        setPaymentId(response.data.paymentId);
        setSuccess(`Bank transfer initiated! Please transfer $${amount} to the provided account.`);
        onPaymentSuccess && onPaymentSuccess(response.data);
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

  const handleProofUpload = async () => {
    if (!proofFile || !paymentId) {
      setError('Please select a proof file and ensure payment is initiated');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // In a real app, you'd upload to a file service first
      const proofUrl = `https://example.com/proofs/${proofFile.name}`;
      
      const response = await apiService.request('/payments/upload-proof', {
        method: 'POST',
        body: JSON.stringify({
          paymentId: paymentId,
          proofUrl: proofUrl
        })
      });

      if (response.success) {
        setSuccess('Payment proof uploaded successfully! Admin will review and approve.');
        setProofFile(null);
        setPaymentId(null);
      } else {
        setError(response.message || 'Failed to upload proof');
      }
    } catch (error) {
      setError('Failed to upload proof. Please try again.');
    } finally {
      setIsProcessing(false);
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

    switch (paymentMethod) {
      case 'mobile_money':
        await handleMobileMoneyPayment();
        break;
      case 'bank_transfer':
        await handleBankTransferPayment();
        break;
      case 'paypal':
        await handlePayPalPayment();
        break;
      case 'mock':
        await handleMockPayment();
        break;
      default:
        setError('Please select a payment method');
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
                  id="mobile_money"
                  name="paymentMethod"
                  value="mobile_money"
                  checked={paymentMethod === 'mobile_money'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isProcessing}
                />
                <Label htmlFor="mobile_money" className="flex items-center gap-2 cursor-pointer">
                  <Phone className="h-4 w-4" />
                  Mobile Money
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="bank_transfer"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isProcessing}
                />
                <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer">
                  <Building className="h-4 w-4" />
                  Bank Transfer
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
            </div>
          </div>

          {paymentMethod === 'mobile_money' && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isProcessing}
                required
              />
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Your Bank Account Number</Label>
              <Input
                id="bankAccount"
                placeholder="Enter your bank account number"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                disabled={isProcessing}
                required
              />
            </div>
          )}

          {bankConfig && (paymentMethod === 'mobile_money' || paymentMethod === 'bank_transfer') && (
            <Alert className="border-blue-200 bg-blue-50">
              <Building className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Transfer to:</strong><br />
                Account: {bankConfig.accountName}<br />
                Number: {bankConfig.accountNumber}<br />
                Bank: {bankConfig.bankName}
              </AlertDescription>
            </Alert>
          )}

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
              paymentMethod === 'paypal' ? 'Pay with PayPal' : 
              paymentMethod === 'mobile_money' ? 'Send Mobile Money' :
              paymentMethod === 'bank_transfer' ? 'Initiate Bank Transfer' :
              'Process Mock Payment'
            )}
          </Button>

          {paymentId && (paymentMethod === 'mobile_money' || paymentMethod === 'bank_transfer') && (
            <div className="space-y-2">
              <Label htmlFor="proofFile">Upload Payment Proof</Label>
              <Input
                id="proofFile"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files[0])}
                disabled={isProcessing}
              />
              <Button
                type="button"
                onClick={handleProofUpload}
                disabled={!proofFile || isProcessing}
                className="w-full"
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Proof
              </Button>
            </div>
          )}

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