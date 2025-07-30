import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { 
  User, 
  Shield, 
  Settings, 
  LogOut, 
  Key, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Users,
  Car,
  Wrench
} from 'lucide-react';
import { apiService } from '../services/api';


const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [sessionTimeout, setSessionTimeout] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('autocare_user');
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('🔍 Restored user from localStorage:', userData);
          
          // Validate token with backend
          const validatedUser = await validateToken(token);
          if (validatedUser) {
            setUser(validatedUser);
            loadUserPermissions(validatedUser);
            startSessionTimer();
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('autocare_user');
          }
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
          localStorage.removeItem('autocare_user');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('autocare_user');
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async (token) => {
    try {
      const response = await apiService.request('/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success) {
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  };

  const loadUserPermissions = (userData) => {
    const permissions = {
      // Admin permissions
      admin: {
        canManageUsers: true,
        canManageServices: true,
        canManagePayments: true,
        canViewAllMessages: true,
        canManageBankAccounts: true,
        canViewAnalytics: true,
        canManageTrucks: true,
        canApproveRequests: true,
        canDeleteData: true,
        canExportData: true
      },
      // User permissions
      user: {
        canRequestServices: true,
        canViewOwnMessages: true,
        canMakePayments: true,
        canViewOwnHistory: true,
        canUpdateProfile: true,
        canShareLocation: true
      }
    };

    const userPermissions = permissions[userData.role] || permissions.user;
    setPermissions(userPermissions);
  };

  const startSessionTimer = () => {
    // Clear existing timer
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    // Set new timer (24 hours)
    const timeout = setTimeout(() => {
      logout('Session expired. Please login again.');
    }, 24 * 60 * 60 * 1000);

    setSessionTimeout(timeout);
  };

  const login = async (email, password) => {
    try {
      setError('');
      console.log('🔐 Frontend login attempt:', { email, password: '***' });
      
      const response = await apiService.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      console.log('📋 Login response:', response);

      if (response.success) {
        const { token, user: userData } = response;
        console.log('✅ Login successful, user data:', userData);
        
        localStorage.setItem('token', token);
        localStorage.setItem('autocare_user', JSON.stringify(userData));
        setUser(userData);
        loadUserPermissions(userData);
        startSessionTimer();
        setShowLogin(false);
        
        // Role-based redirect
        if (userData.role === 'admin' || userData.isAdmin) {
          console.log('👑 Admin login detected - redirecting to admin dashboard');
          // Redirect to admin dashboard
          window.location.href = '/admin';
        } else {
          console.log('👤 User login detected - redirecting to user dashboard');
          // Redirect to user dashboard
          window.location.href = '/dashboard';
        }
        
        return { success: true };
      } else {
        console.log('❌ Login failed:', response.message);
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setError('Login failed. Please try again.');
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      setError('');
      const response = await apiService.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.success) {
        const { token, user: newUser } = response;
        localStorage.setItem('token', token);
        setUser(newUser);
        loadUserPermissions(newUser);
        startSessionTimer();
        setShowRegister(false);
        return { success: true };
      } else {
        setError(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = (message = 'Logged out successfully') => {
    localStorage.removeItem('token');
    localStorage.removeItem('autocare_user');
    setUser(null);
    setPermissions({});
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    setError(message);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      if (response.success) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Profile update failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiService.request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.success) {
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Password change failed' };
    }
  };

  const hasPermission = (permission) => {
    return permissions[permission] || false;
  };

  const isAdmin = () => {
    const adminStatus = user?.role === 'admin' || user?.isAdmin;
    console.log('🔍 Admin check:', { 
      user: user?.name, 
      role: user?.role, 
      isAdmin: user?.isAdmin, 
      adminStatus 
    });
    return adminStatus;
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  const canAccess = (requiredPermissions = []) => {
    if (!user) return false;
    if (isAdmin()) return true; // Admins have all permissions
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  const LoginModal = () => (
    <AnimatePresence>
      {showLogin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Key className="h-6 w-6" />
                  Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LoginForm onClose={() => setShowLogin(false)} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const RegisterModal = () => (
    <AnimatePresence>
      {showRegister && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-6 w-6" />
                  Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RegisterForm onClose={() => setShowRegister(false)} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const LoginForm = ({ onClose }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        onClose();
      }
      
      setIsLoading(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="fade-in">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="form-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-white">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="form-input pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 btn-epic"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Logging In...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Login
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            Cancel
          </Button>
        </div>

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            Don't have an account? Register
          </Button>
        </div>
      </form>
    );
  };

  const RegisterForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);
      
      const result = await register(formData);
      
      if (result.success) {
        onClose();
      }
      
      setIsLoading(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="fade-in">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="name" className="text-white">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="form-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="form-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-white">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="form-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-white">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="form-input pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="form-input pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 btn-epic"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Creating Account...
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Register
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            Cancel
          </Button>
        </div>

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            Already have an account? Login
          </Button>
        </div>
      </form>
    );
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasPermission,
    isAdmin,
    isUser,
    canAccess,
    setShowLogin,
    setShowRegister,
    permissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal />
      <RegisterModal />
    </AuthContext.Provider>
  );
};