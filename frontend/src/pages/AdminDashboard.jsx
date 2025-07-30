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
  Star,
  Car,
  Settings,
  User,
  CreditCard,
  FileText,
  BarChart3,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  HardDrive,
  Wifi,
  LogOut,
  Bot,
  Send,
  X,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';


import NotificationSystem from '../components/NotificationSystem';
import EpicMap from '../components/EpicMap';


const AdminDashboard = () => {
  const { user, logout } = useAuth();
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
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I\'m your AutoCare AI Assistant. I can help you with service requests, payments, fleet management, and more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiCapabilities] = useState([
    'Service Request Processing',
    'Payment Assistance', 
    'Fleet Management',
    'User Management',
    'Analytics & Reports',
    'System Monitoring',
    'General Inquiries',
    '24/7 Support'
  ]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Enhanced admin state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  
  // Mock data for enhanced features
  const [allUsers, setAllUsers] = useState([
    { id: 1, name: 'John Driver', email: 'john@autocare.com', role: 'driver', status: 'active', location: 'Nairobi CBD', joinDate: '2024-01-15' },
    { id: 2, name: 'Sarah Mechanic', email: 'sarah@autocare.com', role: 'mechanic', status: 'active', location: 'Westlands', joinDate: '2024-01-10' },
    { id: 3, name: 'Mike Support', email: 'mike@autocare.com', role: 'support', status: 'inactive', location: 'Eastleigh', joinDate: '2024-01-05' }
  ]);
  
  const [allVehicles, setAllVehicles] = useState([
    { id: '001', name: 'Truck 001', plate: 'KCA 123A', type: 'Pickup', driver: 'John Driver', status: 'active', location: 'Nairobi CBD', lastService: '2024-01-10', mileage: 45000 },
    { id: '002', name: 'Van 002', plate: 'KCA 456B', type: 'Van', driver: 'Sarah Mechanic', status: 'maintenance', location: 'Westlands', lastService: '2024-01-05', mileage: 32000 },
    { id: '003', name: 'Truck 003', plate: 'KCA 789C', type: 'Truck', driver: 'Mike Support', status: 'active', location: 'Eastleigh', lastService: '2024-01-12', mileage: 28000 }
  ]);
  
  const [paymentHistory, setPaymentHistory] = useState([
    { id: 1, customer: 'Alice Johnson', amount: 5000, status: 'completed', method: 'M-Pesa', date: '2024-01-15', invoice: 'INV-001' },
    { id: 2, customer: 'Bob Wilson', amount: 3500, status: 'pending', method: 'Card', date: '2024-01-14', invoice: 'INV-002' },
    { id: 3, customer: 'Carol Davis', amount: 7200, status: 'failed', method: 'M-Pesa', date: '2024-01-13', invoice: 'INV-003' }
  ]);
  
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, user: 'Admin User', action: 'Approved service request', target: 'Request #1234', timestamp: new Date(Date.now() - 300000) },
    { id: 2, user: 'Admin User', action: 'Added new vehicle', target: 'Truck 004', timestamp: new Date(Date.now() - 600000) },
    { id: 3, user: 'Admin User', action: 'Updated user role', target: 'John Driver → Senior Driver', timestamp: new Date(Date.now() - 900000) }
  ]);

  useEffect(() => {
    if (!socket) return;

    // Join admin room
    socket.emit('join-admin-room');

    // Listen for new requests
    socket.on('pickup-request-received', (data) => {
      setRequests(prev => [data, ...prev]);
      setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests + 1 }));
    });

    // Listen for new messages
    socket.on('message-received', (data) => {
      setMessages(prev => [data, ...prev]);
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

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
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
      showNotification('Request approved successfully!', 'success');
    } else if (action === 'rejected') {
      showNotification('Request rejected', 'error');
    }
  };

  const handleAddVehicle = () => {
    showNotification('Vehicle added successfully!', 'success');
    setShowAddVehicle(false);
  };

  const handleAddUser = () => {
    showNotification('User added successfully!', 'success');
    setShowAddUser(false);
  };

  const handleExportData = () => {
    showNotification('Data exported successfully!', 'success');
    setShowExportModal(false);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    showNotification(`Editing ${vehicle.name}`, 'info');
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    showNotification(`Viewing ${user.name}`, 'info');
  };

  const handleDispatchAll = () => {
    showNotification('All requests dispatched!', 'success');
  };

  const handleExportReport = () => {
    showNotification('Payment report exported!', 'success');
  };

  // AI Assistant Functions
  const sendAIMessage = async (message) => {
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date()
    };
    
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(message);
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay for realism
  };

  const generateAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Service Request Processing
    if (message.includes('service') || message.includes('request') || message.includes('help')) {
      return `I can help you with service requests! Currently you have ${stats.pendingRequests} pending requests. Would you like me to show you the details or help you process them?`;
    }
    
    // Payment Assistance
    if (message.includes('payment') || message.includes('money') || message.includes('revenue') || message.includes('cash')) {
      return `Your total revenue is KES ${stats.totalRevenue.toLocaleString()}. This month's revenue is KES 450,000. Would you like me to show you detailed payment analytics or help with payment processing?`;
    }
    
    // Fleet Management
    if (message.includes('fleet') || message.includes('vehicle') || message.includes('truck') || message.includes('car')) {
      return `You have ${stats.activeTrucks} active vehicles in your fleet. I can help you track vehicles, manage maintenance schedules, or dispatch new assignments. What would you like to do?`;
    }
    
    // User Management
    if (message.includes('user') || message.includes('customer') || message.includes('people')) {
      return `You have ${stats.totalUsers} total users with ${stats.totalUsers - 50} active users. I can help you manage user accounts, view user details, or generate user reports.`;
    }
    
    // Analytics
    if (message.includes('analytics') || message.includes('report') || message.includes('data') || message.includes('stats')) {
      return `I can provide you with detailed analytics! Your key metrics: ${stats.totalUsers} users, ${stats.pendingRequests} pending requests, KES ${stats.totalRevenue.toLocaleString()} revenue. Would you like a specific report?`;
    }
    
    // System Monitoring
    if (message.includes('system') || message.includes('monitor') || message.includes('status') || message.includes('health')) {
      return `System status: All systems operational! CPU: 23%, Memory: 67%, Network: 1.2GB/s, Uptime: 99.9%. Everything is running smoothly.`;
    }
    
    // Greeting
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `Hello! I'm your AutoCare AI Assistant. I can help you with service requests, payments, fleet management, user management, analytics, and system monitoring. What would you like to know?`;
    }
    
    // Help
    if (message.includes('help') || message.includes('what can you do') || message.includes('capabilities')) {
      return `I can help you with: Service Request Processing, Payment Assistance, Fleet Management, User Management, Analytics & Reports, System Monitoring, General Inquiries, and 24/7 Support. Just ask me anything!`;
    }
    
    // Default response
    return `I understand you're asking about "${userMessage}". I can help you with service requests, payments, fleet management, user management, analytics, and system monitoring. Could you be more specific about what you need?`;
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (aiInput.trim()) {
      sendAIMessage(aiInput.trim());
    }
  };

  const clearAIChat = () => {
    setAiMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: 'Hello! I\'m your AutoCare AI Assistant. I can help you with service requests, payments, fleet management, and more. How can I assist you today?',
        timestamp: new Date()
      }
    ]);
  };

  // Enhanced Admin Functions
  const handleUserAction = (userId, action) => {
    setAllUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: action === 'activate' ? 'active' : 'inactive' }
          : user
      )
    );
    showNotification(`User ${action === 'activate' ? 'activated' : 'deactivated'} successfully!`, 'success');
  };

  const handleVehicleAction = (vehicleId, action) => {
    setAllVehicles(prev => 
      prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, status: action === 'activate' ? 'active' : 'maintenance' }
          : vehicle
      )
    );
    showNotification(`Vehicle ${action === 'activate' ? 'activated' : 'put in maintenance'} successfully!`, 'success');
  };

  const handlePaymentAction = (paymentId, action) => {
    setPaymentHistory(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: action }
          : payment
      )
    );
    showNotification(`Payment ${action} successfully!`, 'success');
  };

  const handleBroadcastMessage = (message) => {
    showNotification('Broadcast message sent to all users!', 'success');
    setShowBroadcastModal(false);
  };

  const handleSystemSettings = (settings) => {
    showNotification('System settings updated successfully!', 'success');
    setShowSystemSettings(false);
  };

  const exportReport = (type) => {
    showNotification(`${type} report exported successfully!`, 'success');
  };

  const handleRoleChange = (userId, newRole) => {
    setAllUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      )
    );
    showNotification(`User role updated to ${newRole}!`, 'success');
  };

  const handlePasswordReset = (userId) => {
    showNotification('Password reset email sent!', 'success');
  };

  const handleMaintenanceMode = (enabled) => {
    showNotification(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}!`, 'info');
  };

  const handleSessionTimeout = (minutes) => {
    showNotification(`Session timeout set to ${minutes} minutes!`, 'success');
  };

  const handlePasswordPolicy = (policy) => {
    showNotification('Password policy updated!', 'success');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity /> },
    { id: 'requests', label: 'Service Requests', icon: <Truck /> },
    { id: 'fleet', label: 'Fleet Management', icon: <Car /> },
    { id: 'users', label: 'User Management', icon: <Users /> },
    { id: 'payments', label: 'Payments', icon: <DollarSign /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp /> },
    { id: 'monitoring', label: 'System Monitoring', icon: <BarChart3 /> },
    { id: 'map', label: 'Live Map', icon: <MapPin /> },
    { id: 'settings', label: 'Settings', icon: <Settings /> }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AutoCare Pro</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
        
        {/* User Info */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{user?.name}</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
              <motion.button
                onClick={() => logout()}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen bg-gray-950">
        {/* Top Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-gray-400 text-sm">
                Welcome back, {user?.name} - System Administrator
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationSystem />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAI(!showAI)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                AI Assistant
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-red-500/50 transition-all duration-300 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-orange-500/50 transition-all duration-300 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Pending Requests</p>
                        <p className="text-3xl font-bold text-orange-400 mt-1">{stats.pendingRequests}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-orange-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-500/50 transition-all duration-300 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Completed</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">{stats.completedRequests}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-red-500/50 transition-all duration-300 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Revenue</p>
                        <p className="text-3xl font-bold text-red-400 mt-1">KES {stats.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg"
                  >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      Recent Requests
                    </h3>
                    <div className="space-y-3">
                      {requests.slice(0, 5).map((request) => (
                        <motion.div
                          key={request.id}
                          className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
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

                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg"
                  >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-400" />
                      Recent Messages
                    </h3>
                    <div className="space-y-3">
                      {messages.slice(0, 5).map((message) => (
                        <motion.div
                          key={message.id}
                          className="p-3 bg-gray-800 rounded-lg border border-gray-700"
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

            {/* Service Requests Tab */}
            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Service Requests</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDispatchAll}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Dispatch All
                  </motion.button>
                </div>

                <div className="grid gap-4">
                  {requests.map((request) => (
                    <motion.div
                      key={request.id}
                      className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                            <Truck className="h-6 w-6 text-red-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{request.userName}</h3>
                            <p className="text-sm text-gray-400">{request.serviceType}</p>
                            <p className="text-xs text-gray-500">{request.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
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
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRequestAction(request.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Approve
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRequestAction(request.id, 'rejected')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Reject
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Fleet Management Tab */}
            {activeTab === 'fleet' && (
              <motion.div
                key="fleet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Fleet Management</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddVehicle(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Total Vehicles</p>
                        <p className="text-3xl font-bold text-white mt-1">24</p>
                      </div>
                      <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                        <Car className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Active Vehicles</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">18</p>
                      </div>
                      <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">In Maintenance</p>
                        <p className="text-3xl font-bold text-orange-400 mt-1">6</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-orange-400" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Fleet Details</h3>
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="all">All Vehicles</option>
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allVehicles
                      .filter(vehicle => filterStatus === 'all' || vehicle.status === filterStatus)
                      .map((vehicle) => (
                      <motion.div
                        key={vehicle.id}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                            <Car className="h-5 w-5 text-red-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{vehicle.name}</p>
                            <p className="text-sm text-gray-400">Plate: {vehicle.plate}</p>
                            <p className="text-sm text-gray-400">Type: {vehicle.type}</p>
                            <p className="text-sm text-gray-400">Driver: {vehicle.driver}</p>
                            <p className="text-xs text-gray-500">Location: {vehicle.location}</p>
                            <p className="text-xs text-gray-500">Last Service: {vehicle.lastService}</p>
                            <p className="text-xs text-gray-500">Mileage: {vehicle.mileage.toLocaleString()} km</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            vehicle.status === 'active' ? 'bg-green-400/20 text-green-400' :
                            'bg-orange-400/20 text-orange-400'
                          }`}>
                            {vehicle.status}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVehicleAction(vehicle.id, vehicle.status === 'active' ? 'maintenance' : 'activate')}
                            className={`px-3 py-1 rounded text-sm ${
                              vehicle.status === 'active' 
                                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {vehicle.status === 'active' ? 'Send to Maintenance' : 'Activate'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditVehicle(vehicle)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          >
                            Edit
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">User Management</h2>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddUser(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add User
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowExportModal(true)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-white mt-1">1,247</p>
                      </div>
                      <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Active Users</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">892</p>
                      </div>
                      <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">New This Month</p>
                        <p className="text-3xl font-bold text-purple-400 mt-1">156</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Premium Users</p>
                        <p className="text-3xl font-bold text-yellow-400 mt-1">89</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                        <Crown className="h-6 w-6 text-yellow-400" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">All Users</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allUsers
                      .filter(user => 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .filter(user => filterStatus === 'all' || user.status === filterStatus)
                      .map((user) => (
                      <motion.div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'driver' ? 'bg-blue-400/20 text-blue-400' :
                                user.role === 'mechanic' ? 'bg-green-400/20 text-green-400' :
                                'bg-purple-400/20 text-purple-400'
                              }`}>
                                {user.role}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.status === 'active' ? 'bg-green-400/20 text-green-400' :
                                'bg-gray-400/20 text-gray-400'
                              }`}>
                                {user.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Location: {user.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUserAction(user.id, user.status === 'active' ? 'deactivate' : 'activate')}
                            className={`px-3 py-1 rounded text-sm ${
                              user.status === 'active' 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRoleChange(user.id, user.role === 'driver' ? 'mechanic' : 'driver')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          >
                            Change Role
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePasswordReset(user.id)}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
                          >
                            Reset Password
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Payment Management</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportReport}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Report
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold text-white mt-1">KES 2.4M</p>
                      </div>
                      <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">This Month</p>
                        <p className="text-3xl font-bold text-blue-400 mt-1">KES 450K</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Pending Payments</p>
                        <p className="text-3xl font-bold text-orange-400 mt-1">KES 125K</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-orange-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Failed Payments</p>
                        <p className="text-3xl font-bold text-red-400 mt-1">KES 15K</p>
                      </div>
                      <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Payment History</h3>
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="all">All Payments</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => exportReport('Payment')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </motion.button>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {paymentHistory
                      .filter(payment => filterStatus === 'all' || payment.status === filterStatus)
                      .map((payment) => (
                      <motion.div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{payment.customer}</p>
                            <p className="text-sm text-gray-400">{payment.method} • {payment.date}</p>
                            <p className="text-xs text-gray-500">Invoice: {payment.invoice}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">KES {payment.amount.toLocaleString()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            payment.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                            payment.status === 'pending' ? 'bg-orange-400/20 text-orange-400' :
                            'bg-red-400/20 text-red-400'
                          }`}>
                            {payment.status}
                          </span>
                          {payment.status === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePaymentAction(payment.id, 'completed')}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                            >
                              Approve
                            </motion.button>
                          )}
                          {payment.status === 'failed' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePaymentAction(payment.id, 'pending')}
                              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
                            >
                              Retry
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Messages</h2>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowBroadcastModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Broadcast
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => showNotification('Marking all as read', 'success')}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark All Read
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-400" />
                      Recent Messages
                    </h3>
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          className="p-4 bg-gray-800 rounded-lg border border-gray-700"
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

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-orange-400" />
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { id: 1, type: 'info', message: 'New user registration', time: '2 min ago' },
                        { id: 2, type: 'warning', message: 'Payment failed for order #1234', time: '5 min ago' },
                        { id: 3, type: 'success', message: 'Service request completed', time: '10 min ago' }
                      ].map((notification) => (
                        <motion.div
                          key={notification.id}
                          className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              notification.type === 'info' ? 'bg-blue-400' :
                              notification.type === 'warning' ? 'bg-orange-400' :
                              'bg-green-400'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-white">{notification.message}</p>
                              <p className="text-xs text-gray-400">{notification.time}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
                    <div className="h-64 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Chart Placeholder</p>
                        <p className="text-2xl font-bold text-white mt-2">KES 2.4M</p>
                        <p className="text-green-400 text-sm">+12.5% vs last month</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">Service Types</h3>
                    <div className="h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Chart Placeholder</p>
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-white">Oil Change</span>
                            <span className="text-green-400">45%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white">Brake Service</span>
                            <span className="text-blue-400">30%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white">Engine Repair</span>
                            <span className="text-orange-400">25%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">User Growth</h3>
                    <div className="h-64 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Chart Placeholder</p>
                        <p className="text-2xl font-bold text-white mt-2">1,247 Users</p>
                        <p className="text-green-400 text-sm">+8.3% vs last month</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* System Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <motion.div
                key="monitoring"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">System Monitoring</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => showNotification('System refresh initiated', 'success')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">CPU Usage</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">23%</p>
                      </div>
                      <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Memory Usage</p>
                        <p className="text-3xl font-bold text-blue-400 mt-1">67%</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <HardDrive className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Network</p>
                        <p className="text-3xl font-bold text-purple-400 mt-1">1.2GB/s</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <Wifi className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Uptime</p>
                        <p className="text-3xl font-bold text-yellow-400 mt-1">99.9%</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-400" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Logs</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {[
                        { time: '14:32', level: 'INFO', message: 'User login successful' },
                        { time: '14:30', level: 'WARN', message: 'High memory usage detected' },
                        { time: '14:28', level: 'ERROR', message: 'Payment gateway timeout' },
                        { time: '14:25', level: 'INFO', message: 'New user registration' }
                      ].map((log, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                          <span className="text-xs text-gray-400">{log.time}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            log.level === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                            log.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {log.level}
                          </span>
                          <span className="text-sm text-gray-300">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      {[
                        { user: 'Admin User', ip: '192.168.1.100', time: '2 min ago' },
                        { user: 'John Doe', ip: '192.168.1.101', time: '5 min ago' },
                        { user: 'Jane Smith', ip: '192.168.1.102', time: '12 min ago' }
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                          <div>
                            <p className="font-semibold text-white">{session.user}</p>
                            <p className="text-sm text-gray-400">{session.ip}</p>
                          </div>
                          <span className="text-xs text-gray-500">{session.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Live Map Tab */}
            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Live Fleet Tracking</h2>
                
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                  <div className="h-96 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400/20 to-green-400/20 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">Map Component</p>
                      <p className="text-gray-500 text-sm">Live fleet tracking will be integrated here</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Active Vehicles</h3>
                    <div className="space-y-3">
                      {[
                        { id: '001', name: 'Truck 001', location: 'Nairobi CBD', status: 'active' },
                        { id: '002', name: 'Van 002', location: 'Westlands', status: 'active' },
                        { id: '003', name: 'Truck 003', location: 'Eastleigh', status: 'maintenance' }
                      ].map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                          <div>
                            <p className="font-semibold text-white">{vehicle.name}</p>
                            <p className="text-sm text-gray-400">{vehicle.location}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            vehicle.status === 'active' ? 'bg-green-400/20 text-green-400' :
                            'bg-orange-400/20 text-orange-400'
                          }`}>
                            {vehicle.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">System Settings</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Email Notifications</p>
                          <p className="text-sm text-gray-400">Receive email alerts</p>
                        </div>
                        <button className="w-12 h-6 bg-red-600 rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">SMS Notifications</p>
                          <p className="text-sm text-gray-400">Receive SMS alerts</p>
                        </div>
                        <button className="w-12 h-6 bg-gray-500 rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Auto Dispatch</p>
                          <p className="text-sm text-gray-400">Automatically assign requests</p>
                        </div>
                        <button className="w-12 h-6 bg-red-600 rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Two-Factor Auth</p>
                          <p className="text-sm text-gray-400">Enhanced security</p>
                        </div>
                        <button 
                          onClick={() => showNotification('2FA enabled', 'success')}
                          className="w-12 h-6 bg-red-600 rounded-full relative"
                        >
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Session Timeout</p>
                          <p className="text-sm text-gray-400">24 hours</p>
                        </div>
                        <button 
                          onClick={() => handleSessionTimeout(1440)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Change
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Password Policy</p>
                          <p className="text-sm text-gray-400">Strong passwords required</p>
                        </div>
                        <button 
                          onClick={() => handlePasswordPolicy('strong')}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Configure
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Maintenance Mode</p>
                          <p className="text-sm text-gray-400">Temporarily pause system</p>
                        </div>
                        <button 
                          onClick={() => handleMaintenanceMode(false)}
                          className="w-12 h-6 bg-gray-500 rounded-full relative"
                        >
                          <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Audit Logs</p>
                          <p className="text-sm text-gray-400">View system activity</p>
                        </div>
                        <button 
                          onClick={() => setShowAuditLogs(true)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          View Logs
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Broadcast Message Modal */}
      {showBroadcastModal && (
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
              <h3 className="text-xl font-bold text-white mb-4">Send Broadcast Message</h3>
              <textarea
                placeholder="Enter your message to all users..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 mb-4"
                rows={4}
              />
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBroadcastMessage('Test message')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Send Broadcast
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Audit Logs Modal */}
      {showAuditLogs && (
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
            className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-4xl h-96 shadow-2xl"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">System Audit Logs</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuditLogs(false)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{log.user}</p>
                        <p className="text-sm text-gray-400">{log.action}</p>
                        <p className="text-xs text-gray-500">Target: {log.target}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* AI Assistant Modal */}
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
            className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-4xl h-[600px] shadow-2xl flex flex-col"
          >
            {/* AI Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AutoCare AI</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={clearAIChat}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Clear Chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => setShowAI(false)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Leave"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* AI Capabilities */}
            <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700">
              <div className="flex flex-wrap gap-2">
                {aiCapabilities.map((capability, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full border border-red-600/30"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {aiMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-red-600 order-1 ml-2' 
                      : 'bg-gradient-to-br from-red-500 to-red-600 order-2 mr-2'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mr-2">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-800 text-gray-100 border border-gray-700 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-6 border-t border-gray-800">
              <form onSubmit={handleAISubmit} className="flex gap-3">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask me anything about AutoCare Pro..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  disabled={isTyping}
                />
                <motion.button
                  type="submit"
                  disabled={!aiInput.trim() || isTyping}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                  Send
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Notification */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 p-4 rounded-lg z-50 shadow-lg ${
            notification.type === 'success' ? 'bg-green-600' :
            notification.type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          } text-white`}
        >
          {notification.message}
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;