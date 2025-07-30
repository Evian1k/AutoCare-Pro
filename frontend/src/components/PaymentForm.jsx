import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, DollarSign, CheckCircle, Building } from 'lucide-react';

const PaymentForm = ({ onPaymentSuccess, onPaymentError }) => {
  const [amount, setAmount] = useState('55.00');
  const [description, setDescription] = useState('Service description');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('1234 5678 9012 3456');
  const [expiryDate, setExpiryDate] = useState('12/25');
  const [cvv, setCvv] = useState('123');
  const [cardholderName, setCardholderName] = useState('John Doe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCardPayment = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess('Payment completed successfully! This is a demo payment.');
      onPaymentSuccess && onPaymentSuccess({ amount: parseFloat(amount) * 100 });
      
      // Reset form after success
      setTimeout(() => {
        setAmount('55.00');
        setDescription('Service description');
        setCardNumber('1234 5678 9012 3456');
        setExpiryDate('12/25');
        setCvv('123');
        setCardholderName('John Doe');
        setSuccess('');
      }, 3000);
    }, 2000);
  };

  const handleBankTransfer = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    // Simulate bank transfer
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess('Bank transfer details sent! This is a demo transfer.');
      onPaymentSuccess && onPaymentSuccess({ amount: parseFloat(amount) * 100 });
      
      // Reset form after success
      setTimeout(() => {
        setAmount('55.00');
        setDescription('Service description');
        setSuccess('');
      }, 3000);
    }, 2000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    switch (paymentMethod) {
      case 'card':
        await handleCardPayment();
        break;
      case 'bank_transfer':
        await handleBankTransfer();
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
          Demo Payment
        </CardTitle>
        <CardDescription>
          This is a demo payment system for testing purposes
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
            <Label htmlFor="amount">Amount (KES)</Label>
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
                  id="card"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isProcessing}
                />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  Credit/Debit Card
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
            </div>
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  disabled={isProcessing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  disabled={isProcessing}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    disabled={isProcessing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    disabled={isProcessing}
                    required
                  />
                </div>
              </div>
            </div>
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
              paymentMethod === 'card' ? 'Pay with Card' : 'Initiate Bank Transfer'
            )}
          </Button>

          {paymentMethod === 'bank_transfer' && (
            <Alert className="border-blue-200 bg-blue-50">
              <Building className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Demo Bank Transfer Details:</strong><br />
                Bank: AutoCare Pro Bank<br />
                Account: 1234567890<br />
                Reference: Your service request ID
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-gray-500 text-center">
            <p>⚠️ This is a demo payment system for testing purposes only.</p>
            <p>No real payments will be processed.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm; 