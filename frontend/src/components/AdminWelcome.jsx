import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Crown, 
  Zap, 
  Users, 
  Car, 
  Wrench, 
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  Star,
  Rocket
} from 'lucide-react';


const AdminWelcome = ({ user }) => {
  const [currentEmoji, setCurrentEmoji] = useState('👑');
  const [showWelcome, setShowWelcome] = useState(true);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    activePayments: 0,
    unreadMessages: 0
  });

  const emojis = ['👑', '🚀', '⚡', '🔥', '💎', '🌟', '🎸', '🎯', '💪', '🏆'];
  const adminFeatures = [
    { icon: <Users className="h-6 w-6" />, title: 'User Management', desc: 'Manage all users and their accounts' },
    { icon: <Car className="h-6 w-6" />, title: 'Service Requests', desc: 'Review and approve service requests' },
    { icon: <DollarSign className="h-6 w-6" />, title: 'Payment Management', desc: 'Monitor and approve payments' },
    { icon: <MessageSquare className="h-6 w-6" />, title: 'Message Center', desc: 'Respond to user messages' },
    { icon: <BarChart3 className="h-6 w-6" />, title: 'Analytics', desc: 'View detailed system analytics' },
    { icon: <Settings className="h-6 w-6" />, title: 'System Settings', desc: 'Configure system parameters' }
  ];

  useEffect(() => {
    // Epic emoji rotation
    const emojiInterval = setInterval(() => {
      setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }, 2000);

    // Welcome animation

    // Auto-hide welcome after 8 seconds
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 8000);

    return () => {
      clearInterval(emojiInterval);
      clearTimeout(welcomeTimer);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const emojiVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "backOut"
      }
    },
    hover: {
      scale: 1.2,
      rotate: 360,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-4xl"
          >
            <Card className="glass-effect">
              <CardHeader className="text-center">
                <motion.div
                  variants={emojiVariants}
                  whileHover="hover"
                  className="text-8xl mb-4"
                >
                  {currentEmoji}
                </motion.div>
                <CardTitle className="text-4xl mb-2 font-bold text-white">
                  Welcome Back, {user?.name}!
                </CardTitle>
                <p className="text-xl text-gray-300">
                  Ready to manage the AutoCare Pro system?
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Admin Stats */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: <Users className="h-5 w-5" />, label: 'Total Users', value: adminStats.totalUsers },
                    { icon: <Car className="h-5 w-5" />, label: 'Pending Requests', value: adminStats.pendingRequests },
                    { icon: <DollarSign className="h-5 w-5" />, label: 'Active Payments', value: adminStats.activePayments },
                    { icon: <MessageSquare className="h-5 w-5" />, label: 'Unread Messages', value: adminStats.unreadMessages }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="dashboard-card text-center p-4"
                    >
                      <div className="text-2xl mb-2 text-red-400">{stat.icon}</div>
                      <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Admin Features */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-xl mb-4 text-center font-semibold text-white">
                    Your Admin Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="service-card text-center p-4 cursor-pointer"
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 20px 40px rgba(220, 38, 38, 0.3)"
                        }}
                        onClick={() => {}}
                      >
                        <div className="text-3xl mb-3 text-red-400">{feature.icon}</div>
                        <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                        <p className="text-sm text-gray-400">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Epic Action Buttons */}
                <motion.div variants={itemVariants} className="flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-epic px-8 py-3"
                    onClick={() => {
                      setShowWelcome(false);
                    }}
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Get Started
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-animate px-8 py-3 bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => {
                      setShowWelcome(false);
                    }}
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    Admin Panel
                  </motion.button>
                </motion.div>

                {/* Quote */}
                <motion.div variants={itemVariants} className="text-center">
                  <p className="text-gray-400 italic">
                    "With great power comes great responsibility."
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminWelcome; 