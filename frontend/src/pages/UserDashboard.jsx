import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Car, 
  Bell, 
  Wrench, 
  MessageSquare, 
  MapPin, 
  CreditCard, 
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useService } from '@/contexts/ServiceContext';
import { useSocket } from '@/contexts/SocketContext';
import UserHeader from '@/components/user/UserHeader';
import UserOverview from '@/components/user/UserOverview';
import UserRequests from '@/components/user/UserRequests';
import UserNotifications from '@/components/user/UserNotifications';
import UserMessages from '@/components/user/UserMessages';
import LocationSharing from '@/components/user/LocationSharing';
import PaymentForm from '@/components/PaymentForm';
import GoogleMap from '@/components/GoogleMap';
import { api } from '@/services/api';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('booking-updated', (data) => {
      setRequests(prev => 
        prev.map(req => 
          req.id === data.id ? { ...req, ...data } : req
        )
      );
    });

    socket.on('new-notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on('new-message', (message) => {
      setMessages(prev => [message, ...prev]);
    });

    return () => {
      socket.off('booking-updated');
      socket.off('new-notification');
      socket.off('new-message');
    };
  }, [socket]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load requests
      const requestsResponse = await api.get('/bookings');
      if (requestsResponse.data.success) {
        setRequests(requestsResponse.data.data);
      }

      // Load notifications
      const notificationsResponse = await api.get('/notifications');
      if (notificationsResponse.data.success) {
        setNotifications(notificationsResponse.data.data);
      }

      // Load messages
      const messagesResponse = await api.get('/messages');
      if (messagesResponse.data.success) {
        setMessages(messagesResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    // Add notification for successful payment
    const newNotification = {
      id: Date.now(),
      type: 'success',
      title: 'Payment Successful',
      message: `Payment of KES ${paymentIntent.amount / 100} completed successfully`,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleLocationShared = (location) => {
    const newNotification = {
      id: Date.now(),
      type: 'success',
      title: 'Location Shared',
      message: 'Your location has been shared with admins',
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleNewRequest = async (requestData) => {
    try {
      const response = await api.post('/bookings', requestData);
      if (response.data.success) {
        setRequests(prev => [response.data.data, ...prev]);
        setShowNewRequest(false);
        
        // Add notification
        const newNotification = {
          id: Date.now(),
          type: 'info',
          title: 'Service Request Created',
          message: 'Your service request has been submitted successfully',
          timestamp: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleSendMessage = async (messageData) => {
    try {
      const response = await api.post('/messages', messageData);
      if (response.data.success) {
        setMessages(prev => [response.data.data, ...prev]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <Car className="w-4 h-4" /> },
    { id: 'requests', label: 'My Requests', icon: <Wrench className="w-4 h-4" /> },
    { id: 'location', label: 'Location & Map', icon: <MapPin className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const unreadNotifications = notifications.filter(n => !n.read);
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const completedRequests = requests.filter(req => req.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black">
      <Helmet>
        <title>Dashboard - AutoCare Pro</title>
        <meta name="description" content="Manage your vehicle services, track requests, and stay updated with your AutoCare Pro dashboard." />
      </Helmet>

      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AutoCare Pro</h1>
                <p className="text-sm text-gray-400">Vehicle Services</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <User className="w-4 h-4" />
                <span className="font-medium">Welcome back, {user?.name}!</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-white mt-1">{requests.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <Wrench className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-orange-400 mt-1">{pendingRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{completedRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Notifications</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{unreadNotifications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id 
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white" 
                : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              }
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewRequest(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-xl flex items-center gap-3 hover:from-red-700 hover:to-red-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Request</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('location')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl flex items-center gap-3 hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Share Location</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('messages')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl flex items-center gap-3 hover:from-green-700 hover:to-green-800 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Contact Support</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {activeTab === 'overview' && (
            <UserOverview 
              requests={requests}
              notifications={notifications}
              user={user}
              onNewRequest={() => setShowNewRequest(true)}
            />
          )}
          {activeTab === 'requests' && (
            <UserRequests 
              requests={requests}
              onNewRequest={() => setShowNewRequest(true)}
            />
          )}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <LocationSharing onLocationShared={handleLocationShared} />
              <GoogleMap 
                showUserLocations={false}
                allowLocationSharing={true}
                onLocationShared={handleLocationShared}
              />
            </div>
          )}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Make a Payment</h2>
              <PaymentForm onPaymentSuccess={handlePaymentSuccess} />
            </div>
          )}
          {activeTab === 'notifications' && (
            <UserNotifications 
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
            />
          )}
          {activeTab === 'messages' && (
            <UserMessages 
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          )}
        </motion.div>
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md shadow-2xl"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">New Service Request</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleNewRequest({
                  serviceType: formData.get('serviceType'),
                  description: formData.get('description'),
                  location: formData.get('location'),
                  urgency: formData.get('urgency')
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Service Type</label>
                    <select
                      name="serviceType"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      required
                    >
                      <option value="">Select service type</option>
                      <option value="oil_change">Oil Change</option>
                      <option value="tire_change">Tire Change</option>
                      <option value="battery_replacement">Battery Replacement</option>
                      <option value="brake_service">Brake Service</option>
                      <option value="engine_repair">Engine Repair</option>
                      <option value="general_maintenance">General Maintenance</option>
                      <option value="emergency_service">Emergency Service</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      placeholder="Describe your service needs..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      placeholder="Enter your location"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Urgency</label>
                    <select
                      name="urgency"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Submit Request
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNewRequest(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UserDashboard;