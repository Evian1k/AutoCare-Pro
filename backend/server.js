const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import database
const { sequelize, testConnection } = require('./src/config/database');
const { initializeDatabase } = require('./src/config/init-db');

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const serviceRoutes = require('./src/routes/services');
const truckRoutes = require('./src/routes/trucks');
const messageRoutes = require('./src/routes/messages');
const pickupRoutes = require('./src/routes/pickups');
const branchRoutes = require('./src/routes/branches');
const bookingRoutes = require('./src/routes/bookings');
const analyticsRoutes = require('./src/routes/analytics');
const dashboardRoutes = require('./src/routes/dashboard');
const locationRoutes = require('./src/routes/locations');
const paymentRoutes = require('./src/routes/payments');
const bankAccountRoutes = require('./src/routes/bank-accounts');
const darajaRoutes = require('./src/routes/daraja');
const notificationRoutes = require('./src/routes/notifications');
const adminBookingRoutes = require('./src/routes/admin-bookings');

// Import middleware
const { authenticateToken } = require('./src/middleware/auth');
const { errorHandler } = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.io setup for real-time features
const io = new Server(server, {
  cors: {
    origin: [
      process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
      "http://localhost:5176"
    ],
    methods: ["GET", "POST"]
  }
});

// Initialize database
const initializeApp = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
};

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5176',
    'https://auto-care-pro-269h.vercel.app',
    'https://auto-care-pro-269h-git-main-evian1ks-projects.vercel.app',
    'https://auto-care-pro-269h-2pu891u7k-evian1ks-projects.vercel.app',
    process.env.FRONTEND_URL,
    process.env.SOCKET_CORS_ORIGIN
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, authenticateToken, userRoutes);
app.use(`/api/${apiVersion}/services`, authenticateToken, serviceRoutes);
app.use(`/api/${apiVersion}/trucks`, authenticateToken, truckRoutes);
app.use(`/api/${apiVersion}/messages`, authenticateToken, messageRoutes);
app.use(`/api/${apiVersion}/pickups`, authenticateToken, pickupRoutes);
app.use(`/api/${apiVersion}/branches`, authenticateToken, branchRoutes);
app.use(`/api/${apiVersion}/bookings`, authenticateToken, bookingRoutes);
app.use(`/api/${apiVersion}/analytics`, authenticateToken, analyticsRoutes);
app.use(`/api/${apiVersion}/dashboard`, authenticateToken, dashboardRoutes);
app.use(`/api/${apiVersion}/locations`, authenticateToken, locationRoutes);
app.use(`/api/${apiVersion}/payments`, paymentRoutes);
app.use(`/api/${apiVersion}/bank-accounts`, authenticateToken, bankAccountRoutes);
app.use(`/api/${apiVersion}/daraja`, darajaRoutes);
app.use(`/api/${apiVersion}/notifications`, authenticateToken, notificationRoutes);
app.use(`/api/${apiVersion}/admin/bookings`, authenticateToken, adminBookingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.API_VERSION || 'v1'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AutoCare Pro API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: `/api/${apiVersion}/auth`,
      users: `/api/${apiVersion}/users`,
      services: `/api/${apiVersion}/services`,
      trucks: `/api/${apiVersion}/trucks`,
      messages: `/api/${apiVersion}/messages`,
      pickups: `/api/${apiVersion}/pickups`,
      branches: `/api/${apiVersion}/branches`,
      bookings: `/api/${apiVersion}/bookings`,
      analytics: `/api/${apiVersion}/analytics`,
      dashboard: `/api/${apiVersion}/dashboard`
    }
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join user to their room for personal notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Join admin to admin room
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('👨‍💼 Admin joined admin room');
  });

  // Handle truck location updates
  socket.on('truck-location-update', (data) => {
    // Broadcast to all connected clients
    socket.broadcast.emit('truck-location-updated', data);
  });

  // Handle new messages
  socket.on('new-message', (data) => {
    if (data.recipientType === 'admin') {
      // Send to admin room
      socket.to('admin-room').emit('message-received', data);
    } else {
      // Send to specific user
      socket.to(`user-${data.recipientId}`).emit('message-received', data);
    }
  });

  // Handle pickup requests
  socket.on('new-pickup-request', (data) => {
    // Notify all admins
    socket.to('admin-room').emit('pickup-request-received', data);
  });

  // Handle truck dispatch
  socket.on('truck-dispatched', (data) => {
    // Notify the specific user
    socket.to(`user-${data.userId}`).emit('truck-dispatch-update', data);
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('socketio', io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist.`
  });
});

const PORT = process.env.PORT || 3001;

// Start server after database initialization
initializeApp().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 AutoCare Pro Backend Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api/${apiVersion}`);
    console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    console.log('Process terminated');
    await sequelize.close();
  });
});

module.exports = app;