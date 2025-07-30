
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';


const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Loading...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400"
          >
            Please wait while we prepare your dashboard
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role-based redirects
  if (adminOnly && !user.isAdmin && user.role !== 'admin') {
    console.log('🔒 Admin access denied:', { 
      user: user.name, 
      isAdmin: user.isAdmin, 
      role: user.role 
    });
    return <Navigate to="/dashboard" replace />;
  }

  if (userOnly && (user.isAdmin || user.role === 'admin')) {
    console.log('🔒 User access denied for admin:', { 
      user: user.name, 
      isAdmin: user.isAdmin, 
      role: user.role 
    });
    return <Navigate to="/admin" replace />;
  }

  // Entrance animation for protected routes
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        duration: 0.6,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;
