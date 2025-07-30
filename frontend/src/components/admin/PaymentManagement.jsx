import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Building, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  User,
  Phone,
  CreditCard
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const { toast } = useToast();

  // Bank form state
  const [bankForm, setBankForm] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
    accountType: 'business',
    isDefault: false,
    adminNotes: ''
  });

  useEffect(() => {
    loadPayments();
    loadBankAccounts();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/payments/admin/all');
      if (response.success) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBankAccounts = async () => {
    try {
      const response = await apiService.request('/bank-accounts');
      if (response.success) {
        setBankAccounts(response.data);
      }
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
    }
  };

  const handleApprovePayment = async (paymentId, adminNotes = '') => {
    try {
      const response = await apiService.request(`/payments/admin/approve/${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify({ adminNotes })
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Payment approved successfully"
        });
        loadPayments();
      }
    } catch (error) {
      console.error('Failed to approve payment:', error);
      toast({
        title: "Error",
        description: "Failed to approve payment",
        variant: "destructive"
      });
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingBank ? 'PUT' : 'POST';
      const url = editingBank ? `/bank-accounts/${editingBank.id}` : '/bank-accounts';
      
      const response = await apiService.request(url, {
        method,
        body: JSON.stringify(bankForm)
      });

      if (response.success) {
        toast({
          title: "Success",
          description: editingBank ? "Bank account updated" : "Bank account created"
        });
        setShowBankForm(false);
        setEditingBank(null);
        setBankForm({
          accountName: '',
          accountNumber: '',
          bankName: '',
          bankCode: '',
          accountType: 'business',
          isDefault: false,
          adminNotes: ''
        });
        loadBankAccounts();
      }
    } catch (error) {
      console.error('Failed to save bank account:', error);
      toast({
        title: "Error",
        description: "Failed to save bank account",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBank = async (bankId) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    
    try {
      const response = await apiService.request(`/bank-accounts/${bankId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Bank account deleted"
        });
        loadBankAccounts();
      }
    } catch (error) {
      console.error('Failed to delete bank account:', error);
      toast({
        title: "Error",
        description: "Failed to delete bank account",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      mobile_money: Phone,
      bank_transfer: Building,
      paypal: CreditCard,
      mock: DollarSign
    };
    return icons[method] || DollarSign;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments">Payment Management</TabsTrigger>
            <TabsTrigger value="bank-accounts">Bank Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <Card className="glass-effect border-red-900/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Payment Requests</CardTitle>
                  <Button
                    onClick={loadPayments}
                    variant="outline"
                    size="sm"
                    className="border-red-900/50 text-red-300 hover:bg-red-900/20"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-400" />
                    <p className="text-gray-400 mt-2">Loading payments...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400">No payment requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => {
                      const MethodIcon = getPaymentMethodIcon(payment.paymentMethod);
                      return (
                        <Card key={payment.id} className="border-gray-700 bg-gray-800/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <MethodIcon className="w-5 h-5 text-red-400" />
                                <div>
                                  <p className="font-semibold text-white">
                                    ${payment.amount} - {payment.user?.name || 'Unknown User'}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(payment.status)}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setShowPaymentDetails(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {payment.status === 'pending' && payment.paymentProof && (
                              <div className="mt-3 pt-3 border-t border-gray-700">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprovePayment(payment.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve Payment
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank-accounts" className="space-y-4">
            <Card className="glass-effect border-red-900/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Bank Accounts</CardTitle>
                  <Button
                    onClick={() => {
                      setEditingBank(null);
                      setShowBankForm(true);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Bank Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bankAccounts.map((bank) => (
                    <Card key={bank.id} className="border-gray-700 bg-gray-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white">{bank.accountName}</p>
                            <p className="text-sm text-gray-400">
                              {bank.bankName} - {bank.accountNumber}
                            </p>
                            {bank.isDefault && (
                              <Badge className="bg-green-100 text-green-800 mt-1">
                                Default Account
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingBank(bank);
                                setBankForm({
                                  accountName: bank.accountName,
                                  accountNumber: bank.accountNumber,
                                  bankName: bank.bankName,
                                  bankCode: bank.bankCode,
                                  accountType: bank.accountType,
                                  isDefault: bank.isDefault,
                                  adminNotes: bank.adminNotes
                                });
                                setShowBankForm(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!bank.isDefault && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBank(bank.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Payment Details Dialog */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Review payment information and approve if valid
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <p className="text-sm text-gray-600">
                  {selectedPayment.user?.name} ({selectedPayment.user?.email})
                </p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="text-sm text-gray-600">${selectedPayment.amount}</p>
              </div>
              <div>
                <Label>Payment Method</Label>
                <p className="text-sm text-gray-600">
                  {selectedPayment.paymentMethod.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
              </div>
              {selectedPayment.paymentProof && (
                <div>
                  <Label>Payment Proof</Label>
                  <a
                    href={selectedPayment.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Proof
                  </a>
                </div>
              )}
              {selectedPayment.status === 'pending' && selectedPayment.paymentProof && (
                <Button
                  onClick={() => handleApprovePayment(selectedPayment.id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve Payment
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bank Account Form Dialog */}
      <Dialog open={showBankForm} onOpenChange={setShowBankForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
            </DialogTitle>
            <DialogDescription>
              Configure bank account details for receiving payments
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={bankForm.accountName}
                onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="bankCode">Bank Code</Label>
              <Input
                id="bankCode"
                value={bankForm.bankCode}
                onChange={(e) => setBankForm({ ...bankForm, bankCode: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                value={bankForm.accountType}
                onValueChange={(value) => setBankForm({ ...bankForm, accountType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={bankForm.isDefault}
                onChange={(e) => setBankForm({ ...bankForm, isDefault: e.target.checked })}
              />
              <Label htmlFor="isDefault">Set as Default Account</Label>
            </div>
            <div>
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Input
                id="adminNotes"
                value={bankForm.adminNotes}
                onChange={(e) => setBankForm({ ...bankForm, adminNotes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingBank ? 'Update' : 'Create'} Account
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBankForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement; 