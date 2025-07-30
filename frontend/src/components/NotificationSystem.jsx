import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, MessageSquare, AlertTriangle, CheckCircle, DollarSign, Truck, Wrench } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('message-received', (data) => {
      const notification = {
        id: Date.now(),
        type: 'message',
        title: 'New Message',
        message: `Message from ${data.senderName}: ${data.text}`,
        timestamp: new Date(),
        read: false,
        icon: <MessageSquare className="h-5 w-5" />
      };
      addNotification(notification);
    });

    // Listen for new service requests
    socket.on('pickup-request-received', (data) => {
      const notification = {
        id: Date.now(),
        type: 'request',
        title: 'New Service Request',
        message: `New request from ${data.userName}: ${data.serviceType}`,
        timestamp: new Date(),
        read: false,
        icon: <Wrench className="h-5 w-5" />
      };
      addNotification(notification);
    });

    // Listen for payment updates
    socket.on('payment-update', (data) => {
      const notification = {
        id: Date.now(),
        type: 'payment',
        title: 'Payment Update',
        message: `Payment ${data.status}: ${data.amount} KES`,
        timestamp: new Date(),
        read: false,
        icon: <DollarSign className="h-5 w-5" />
      };
      addNotification(notification);
    });

    // Listen for truck updates
    socket.on('truck-location-updated', (data) => {
      const notification = {
        id: Date.now(),
        type: 'truck',
        title: 'Truck Update',
        message: `Truck ${data.truckId} location updated`,
        timestamp: new Date(),
        read: false,
        icon: <Truck className="h-5 w-5" />
      };
      addNotification(notification);
    });

    return () => {
      socket.off('message-received');
      socket.off('pickup-request-received');
      socket.off('payment-update');
      socket.off('truck-location-updated');
    };
  }, [socket]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message': return 'text-blue-400 border-blue-400';
      case 'request': return 'text-orange-400 border-orange-400';
      case 'payment': return 'text-green-400 border-green-400';
      case 'truck': return 'text-purple-400 border-purple-400';
      default: return 'text-red-400 border-red-400';
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'message': return 'bg-blue-400/10';
      case 'request': return 'bg-orange-400/10';
      case 'payment': return 'bg-green-400/10';
      case 'truck': return 'bg-purple-400/10';
      default: return 'bg-red-400/10';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-300"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute right-0 top-16 w-96 max-h-96 overflow-y-auto z-50"
          >
            <div className="bg-black/90 backdrop-blur-xl border-2 border-red-500 rounded-2xl shadow-2xl">
              <div className="p-4 border-b border-red-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`notification ${getNotificationBg(notification.type)} ${
                          !notification.read ? 'border-l-4 border-l-red-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                            {notification.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-white text-sm">
                                {notification.title}
                              </h4>
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {notification.timestamp.toLocaleTimeString()}
                              </span>
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-red-500/30">
                  <button
                    onClick={() => setNotifications([])}
                    className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;