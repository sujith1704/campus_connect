const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Robust environment variable loading
const envCandidates = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'backend', '.env'),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
dotenv.config();

// Initialize Firebase Firestore Database (Loaded)
const { db } = require('./config/firebase');
const { securityHeaders, sanitizeInput } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Disable x-powered-by header
app.disable('x-powered-by');

// Apply security headers
app.use(securityHeaders);

// Configured allowed CORS origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach((orig) => {
    const trimmed = orig.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  });
}

// Enable secure CORS with origin verification
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, server-to-server, postman)
    if (!origin) return callback(null, true);

    // Exact match in allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview and production deployments (*.vercel.app)
    if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // In development mode, allow any localhost port
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
}));

// Body parsing with strict payload limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sanitize incoming inputs
app.use(sanitizeInput);


// Apply general API rate limiting to all /api routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Test endpoint to verify Firestore connectivity & live collections
app.get('/api/test-firestore', async (req, res) => {
  try {
    const testDoc = db.collection('_connection_test').doc('ping');
    const payload = {
      connectedAt: new Date().toISOString(),
      status: 'ok',
      message: 'Firestore connection and read/write successful',
    };
    await testDoc.set(payload);
    const snap = await testDoc.get();
    await testDoc.delete();

    // Query live collection counts from Firestore
    const [usersSnap, eventsSnap, registrationsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('events').get(),
      db.collection('registrations').get(),
    ]);

    const activeProjectId = (process.env.FIREBASE_PROJECT_ID || 'campus-connect-d357c').trim().replace(/^["']|["']$/g, '');

    res.json({
      success: true,
      firebaseConnection: 'successful',
      firestoreReadWrite: 'successful',
      projectId: activeProjectId,
      collections: {
        users: usersSnap.size,
        events: eventsSnap.size,
        registrations: registrationsSnap.size,
      },
      retrievedData: snap.data(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      firebaseConnection: 'error',
      error: error.message,
      code: error.code || null,
      details: error.details || null,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CampusConnect API Server is running',
    database: 'firestore',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to CampusConnect Backend API Server (Powered by Firebase Firestore)');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error handling middleware
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.error('Unhandled Error:', err);
  } else {
    console.error('Unhandled Error:', err.message);
  }

  // Handle CORS errors
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied by CORS policy',
    });
  }

  // Handle oversized body payloads
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request payload exceeds allowable limit (1MB max)',
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = isDev
    ? (err.message || 'Internal Server Error')
    : (statusCode === 500 ? 'Internal Server Error' : err.message);

  res.status(statusCode).json({
    success: false,
    message,
  });
});

const PORT = process.env.PORT || 5000;

// Start Express HTTP Server when run standalone (not in serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 CampusConnect Backend Server listening on port ${PORT}`);
    console.log(`🔥 Database: Firebase Firestore`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
    console.log(`=================================================`);
  });
}

module.exports = app;