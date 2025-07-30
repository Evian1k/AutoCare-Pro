import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Car, 
  MapPin, 
  Calendar,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

const RequestManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0
  });

  useEffect(() => {
    loadRequests();
    loadStats();
  }, [filterStatus]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.request(`/admin/bookings?status=${filterStatus}`);
      if (response.success) {
        setRequests(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.request('/admin/bookings/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleApprove = async (requestId, adminNotes, estimatedCompletion) => {
    try {
      const response = await apiService.request(`/admin/bookings/${requestId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({
          adminNotes,
          estimatedCompletion
        })
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Request approved successfully",
        });
        loadRequests();
        loadStats();
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId, adminNotes, rejectionReason) => {
    try {
      const response = await apiService.request(`/admin/bookings/${requestId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({
          adminNotes,
          rejectionReason
        })
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Request rejected successfully",
        });
        loadRequests();
        loadStats();
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive"
      });
    }
  };

  const handleComplete = async (requestId, adminNotes, completionNotes) => {
    try {
      const response = await apiService.request(`/admin/bookings/${requestId}/complete`, {
        method: 'PUT',
        body: JSON.stringify({
          adminNotes,
          completionNotes
        })
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Request marked as completed",
        });
        loadRequests();
        loadStats();
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error completing request:', error);
      toast({
        title: "Error",
        description: "Failed to complete request",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
              </div>
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by user, service type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadRequests} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-400" />
          <p className="text-gray-400 mt-2">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Requests Found</h3>
            <p className="text-gray-400">No requests match your current filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="bg-gray-900/50 border-gray-800 hover:border-red-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600 rounded-lg">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{request.serviceType}</h3>
                      <p className="text-gray-400">Request ID: {request.id}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {request.user?.name || 'Unknown User'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                        {request.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={`${getStatusColor(request.status)} text-white flex items-center gap-1`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </Badge>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetails(true);
                      }}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </div>
                
                {request.description && (
                  <div className="mt-4 p-3 bg-black/30 rounded-lg">
                    <p className="text-gray-300">{request.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setShowDetails(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

const RequestDetailsModal = ({ request, onClose, onApprove, onReject, onComplete }) => {
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Request Details</h2>
            <Button onClick={onClose} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
              ×
            </Button>
          </div>

          <div className="space-y-6">
            {/* Request Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Service Type</Label>
                <p className="text-white font-medium">{request.serviceType}</p>
              </div>
              <div>
                <Label className="text-gray-400">Status</Label>
                <Badge className={`${getStatusColor(request.status)} text-white`}>
                  {request.status}
                </Badge>
              </div>
              <div>
                <Label className="text-gray-400">User</Label>
                <p className="text-white">{request.user?.name}</p>
              </div>
              <div>
                <Label className="text-gray-400">Created</Label>
                <p className="text-white">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
              {request.location && (
                <div>
                  <Label className="text-gray-400">Location</Label>
                  <p className="text-white">{request.location}</p>
                </div>
              )}
              {request.urgency && (
                <div>
                  <Label className="text-gray-400">Urgency</Label>
                  <p className="text-white capitalize">{request.urgency}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {request.description && (
              <div>
                <Label className="text-gray-400">Description</Label>
                <p className="text-white bg-black/30 p-3 rounded-lg mt-1">{request.description}</p>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add admin notes..."
                className="mt-1"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {request.status === 'pending' && (
                <>
                  <div className="flex-1">
                    <Label htmlFor="estimatedCompletion">Estimated Completion</Label>
                    <Input
                      id="estimatedCompletion"
                      type="date"
                      value={estimatedCompletion}
                      onChange={(e) => setEstimatedCompletion(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={() => onApprove(request.id, adminNotes, estimatedCompletion)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => onReject(request.id, adminNotes, rejectionReason)}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              {request.status === 'approved' && (
                <Button
                  onClick={() => onComplete(request.id, adminNotes, completionNotes)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}

              {request.status === 'pending' && (
                <div className="w-full">
                  <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="mt-1"
                  />
                </div>
              )}

              {request.status === 'approved' && (
                <div className="w-full">
                  <Label htmlFor="completionNotes">Completion Notes</Label>
                  <Textarea
                    id="completionNotes"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Completion notes..."
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RequestManagement; 