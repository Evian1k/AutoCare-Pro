
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import audioSystem from './AudioSystem';

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-black to-red-900"
      >
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 20px rgba(220, 38, 38, 0.4)",
                "0 0 40px rgba(220, 38, 38, 0.8)",
                "0 0 20px rgba(220, 38, 38, 0.4)"
              ]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity },
              boxShadow: { duration: 1, repeat: Infinity }
            }}
            className="w-16 h-16 border-4 border-red-500 rounded-full mx-auto mb-4"
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-2"
          >
            🔥 Loading Epic Experience...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-red-400"
          >
            Preparing your legendary dashboard
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    audioSystem.playError();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Epic role-based redirects
  if (adminOnly && !user.isAdmin && user.role !== 'admin') {
    console.log('🔒 Admin access denied:', { 
      user: user.name, 
      isAdmin: user.isAdmin, 
      role: user.role 
    });
    audioSystem.playError();
    return <Navigate to="/dashboard" replace />;
  }

  if (userOnly && (user.isAdmin || user.role === 'admin')) {
    console.log('🔒 User access denied for admin:', { 
      user: user.name, 
      isAdmin: user.isAdmin, 
      role: user.role 
    });
    audioSystem.playNotification();
    return <Navigate to="/admin" replace />;
  }

  // Epic entrance animation for protected routes
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        duration: 0.6,
        ease: "easeOut"
      }}
      onAnimationStart={() => audioSystem.playSuccess()}
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;
