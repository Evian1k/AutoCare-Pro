import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Truck, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Activity,
  Zap,
  Crown,
  Shield,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import AdminWelcome from '../components/AdminWelcome';
import AIAssistant from '../components/AIAssistant';
import NotificationSystem from '../components/NotificationSystem';
import EpicMap from '../components/EpicMap';
import audioSystem from '../components/AudioSystem';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalRevenue: 0,
    activeTrucks: 0
  });
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Join admin room
    socket.emit('join-admin-room');

    // Listen for new requests
    socket.on('pickup-request-received', (data) => {
      setRequests(prev => [data, ...prev]);
      setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests + 1 }));
      audioSystem.playNotification();
    });

    // Listen for new messages
    socket.on('message-received', (data) => {
      setMessages(prev => [data, ...prev]);
      audioSystem.playMessage();
    });

    // Load initial data
    loadDashboardData();

    return () => {
      socket.off('pickup-request-received');
      socket.off('message-received');
    };
  }, [socket]);

  const loadDashboardData = async () => {
    // Mock data for demonstration
    setStats({
      totalUsers: 156,
      pendingRequests: 8,
      completedRequests: 142,
      totalRevenue: 284500,
      activeTrucks: 12
    });

    setRequests([
      {
        id: 1,
        userName: 'John Doe',
        serviceType: 'Tire Change',
        location: 'Nairobi CBD',
        status: 'pending',
        amount: 2500,
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: 2,
        userName: 'Jane Smith',
        serviceType: 'Battery Replacement',
        location: 'Westlands',
        status: 'approved',
        amount: 3500,
        timestamp: new Date(Date.now() - 600000)
      }
    ]);

    setMessages([
      {
        id: 1,
        senderName: 'Mike Johnson',
        text: 'Need help with my car breakdown',
        timestamp: new Date(Date.now() - 120000)
      },
      {
        id: 2,
        senderName: 'Sarah Wilson',
        text: 'When will the truck arrive?',
        timestamp: new Date(Date.now() - 300000)
      }
    ]);
  };

  const handleRequestAction = (requestId, action) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action }
          : req
      )
    );

    if (action === 'approved') {
      setStats(prev => ({ 
        ...prev, 
        pendingRequests: prev.pendingRequests - 1,
        completedRequests: prev.completedRequests + 1
      }));
      audioSystem.playSuccess();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity /> },
    { id: 'requests', label: 'Requests', icon: <Truck /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp /> },
    { id: 'map', label: 'Live Map', icon: <MapPin /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black">
      {/* Epic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect border-b border-red-500/30 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              👑
            </motion.div>
            <div>
              <h1 className="epic-title text-3xl">ADMIN COMMAND CENTER</h1>
              <p className="epic-subtitle text-red-400">Welcome back, {user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationSystem />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAI(!showAI)}
              className="btn-epic"
            >
              <Zap className="h-5 w-5 mr-2" />
              AI Assistant
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Epic Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="dashboard-card hover-lift"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="dashboard-card hover-lift"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Requests</p>
              <p className="text-3xl font-bold text-orange-400">{stats.pendingRequests}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="dashboard-card hover-lift"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-400">{stats.completedRequests}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="dashboard-card hover-lift"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-3xl font-bold text-yellow-400">KES {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="dashboard-card hover-lift"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Trucks</p>
              <p className="text-3xl font-bold text-purple-400">{stats.activeTrucks}</p>
            </div>
            <Truck className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>
      </motion.div>

      {/* Epic Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-6"
      >
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white neon-glow'
                  : 'text-gray-400 hover:text-white hover:bg-red-600/20'
              }`}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Epic Content Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-6"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <AdminWelcome />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Requests */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="dashboard-card"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    Recent Requests
                  </h3>
                  <div className="space-y-3">
                    {requests.slice(0, 5).map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-red-500/20"
                      >
                        <div>
                          <p className="font-semibold text-white">{request.userName}</p>
                          <p className="text-sm text-gray-400">{request.serviceType}</p>
                          <p className="text-xs text-gray-500">{request.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400">KES {request.amount}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            request.status === 'pending' ? 'bg-orange-400/20 text-orange-400' :
                            request.status === 'approved' ? 'bg-green-400/20 text-green-400' :
                            'bg-gray-400/20 text-gray-400'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Messages */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="dashboard-card"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    Recent Messages
                  </h3>
                  <div className="space-y-3">
                    {messages.slice(0, 5).map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-white/5 rounded-lg border border-blue-500/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-white">{message.senderName}</p>
                          <span className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{message.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="epic-title text-2xl">Service Requests</h2>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-epic"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Dispatch All
                  </motion.button>
                </div>
              </div>

              <div className="grid gap-4">
                {requests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="service-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{request.userName}</h3>
                          <p className="text-gray-400">{request.serviceType}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-red-400" />
                            <span className="text-sm text-gray-400">{request.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">KES {request.amount}</p>
                        <p className="text-sm text-gray-400">
                          {request.timestamp.toLocaleTimeString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {request.status === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRequestAction(request.id, 'approved')}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700"
                              >
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRequestAction(request.id, 'rejected')}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700"
                              >
                                Reject
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="epic-title text-2xl">User Messages</h2>
              
              <div className="grid gap-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="service-card"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-white">{message.senderName}</h3>
                          <span className="text-sm text-gray-400">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{message.text}</p>
                        <div className="flex gap-2 mt-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            Reply
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                          >
                            Mark Read
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="epic-title text-2xl">Analytics Dashboard</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="dashboard-card"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
                  <div className="h-64 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">Chart Placeholder</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="dashboard-card"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Service Types</h3>
                  <div className="h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">Chart Placeholder</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="dashboard-card"
                >
                  <h3 className="text-lg font-bold text-white mb-4">User Growth</h3>
                  <div className="h-64 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">Chart Placeholder</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="epic-title text-2xl">Live Fleet Tracking</h2>
              
              <div className="h-96 rounded-2xl overflow-hidden">
                <EpicMap 
                  center={{ lat: -1.2921, lng: 36.8219 }}
                  zoom={12}
                  markers={[
                    { lat: -1.2921, lng: 36.8219, title: 'Truck 1', type: 'truck' },
                    { lat: -1.2841, lng: 36.8155, title: 'Truck 2', type: 'truck' },
                    { lat: -1.2861, lng: 36.8239, title: 'Service Request', type: 'request' }
                  ]}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {showAI && (
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
              className="epic-modal w-full max-w-4xl h-96"
            >
              <AIAssistant onClose={() => setShowAI(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;