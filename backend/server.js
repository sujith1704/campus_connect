const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection Middleware Guard
app.use((req, res, next) => {
  // Allow health check and root endpoint even if database is connecting
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }

  // Check if MongoDB is connected (readyState 1 = connected)
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is unavailable. Check the MONGO_URI setting and make sure MongoDB is reachable.',
    });
  }
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : (dbState === 2 ? 'connecting' : 'disconnected');
  res.json({
    status: 'ok',
    message: 'CampusConnect API Server is running',
    database: dbStatus,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to CampusConnect Backend API Server');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const connectWithRetry = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB is unavailable. Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Start Express HTTP Server immediately so API & CORS are always active
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 CampusConnect Backend Server listening on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
  console.log(`=================================================`);
});

// Keep trying so authentication starts working when MongoDB becomes available.
connectWithRetry();

module.exports = app;