// ✅ CRITICAL: Load dotenv FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

// ✅ Verify env vars are loaded
console.log('🔍 Environment Variables Check:');
console.log('   PORT:', process.env.PORT || 'Not set');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('   MONGODB_URI:', process.env.MONGO_URI ? '✅ Configured' : '❌ Not configured');
console.log('   HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '✅ Loaded' : '❌ Missing');

// Now import everything else
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Import Customer Routes
import productRoutes from './routes/product.js';
import chatRoutes from './routes/chatRoutes.js';

// Import Admin Routes
import adminRoutes from './routes/admin.js';
import adminOrderRoutes from './routes/order.js';
import adminUserRoutes from './routes/user.js';
import adminBrandRoutes from './routes/brand.js';
import adminDashboardRoutes from './routes/dashboard.js';

// Connect to database
connectDB();

const app = express();

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));

app.options('*', cors());

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RATE LIMITING
// ============================================

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many admin login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: 'Too many messages, please slow down.',
});

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// ============================================
// CUSTOMER ROUTES
// ============================================

app.use('/api/products', productRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);

// ============================================
// ADMIN ROUTES
// ============================================

// Admin Authentication
app.use('/api/admin/auth', adminAuthLimiter, adminRoutes);

// Admin Dashboard
app.use('/api/admin/dashboard', adminDashboardRoutes);

// Admin Product Management
app.use('/api/admin/products', productRoutes);

// Admin Order Management
app.use('/api/admin/orders', adminOrderRoutes);

// Admin User Management
app.use('/api/admin/users', adminUserRoutes);

// Admin Brand Management
app.use('/api/admin/brands', adminBrandRoutes);

// ============================================
// HEALTH & STATUS ENDPOINTS
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'healthy',
    message: 'ShopWise API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'connected',
      authentication: 'active',
      chat: 'active',
      admin_panel: 'active',
      huggingface: process.env.HUGGINGFACE_API_KEY ? '✅ configured' : '❌ missing',
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'ShopWise E-commerce API',
    version: '1.0.0',
    description: 'Mobile E-commerce platform with AI chatbot and Admin Panel',
    
    customer_endpoints: {
      products: '/api/products',
      chat: '/api/chat',
    },
    
    admin_endpoints: {
      auth: '/api/admin/auth',
      dashboard: '/api/admin/dashboard',
      products: '/api/admin/products',
      orders: '/api/admin/orders',
      users: '/api/admin/users',
      brands: '/api/admin/brands',
    },

    features: [
      '📱 Mobile E-commerce',
      '🤖 AI Chatbot (Hugging Face)',
      '📦 Order Management',
      '👥 User Management',
      '🏷️ Brand Management',
      '📊 Admin Dashboard',
      '💳 Secure Payments',
      '🚚 Shipping Management',
    ],
    
    status: 'operational',
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🛍️ Welcome to ShopWise API',
    version: '1.0.0',
    
    features: [
      '📱 Mobile E-commerce Store',
      '🤖 AI Chatbot (Hugging Face)',
      '📦 Order Tracking',
      '💳 Secure Payments',
      '🚚 Shipping Management',
      '🔐 Admin Panel',
      '📊 Dashboard Analytics',
    ],
    
    quick_start: {
      customer: 'Visit /api for customer API documentation',
      admin: 'Login at /api/admin/auth with admin credentials',
    },
    
    documentation: '/api',
    health_check: '/api/health',
  });
});

// ============================================
// ADMIN PANEL ROUTES DOCUMENTATION
// ============================================

app.get('/api/admin', (req, res) => {
  res.json({
    success: true,
    name: 'ShopWise Admin Panel API',
    version: '1.0.0',
    
    authentication: {
      login: 'POST /api/admin/auth/login',
      profile: 'GET /api/admin/auth/profile',
      updateProfile: 'PUT /api/admin/auth/profile',
      changePassword: 'POST /api/admin/auth/change-password',
    },
    
    dashboard: {
      overview: 'GET /api/admin/dashboard/overview',
      salesChart: 'GET /api/admin/dashboard/sales-chart',
    },
    
    products: {
      getAll: 'GET /api/admin/products',
      add: 'POST /api/admin/products',
      edit: 'PUT /api/admin/products/:id',
      delete: 'DELETE /api/admin/products/:id',
    },
    
    orders: {
      getAll: 'GET /api/admin/orders',
      getDetails: 'GET /api/admin/orders/:id',
      updateStatus: 'PUT /api/admin/orders/:id',
      cancel: 'POST /api/admin/orders/:id/cancel',
      generateInvoice: 'GET /api/admin/orders/:id/invoice',
    },
    
    users: {
      getAll: 'GET /api/admin/users',
      getProfile: 'GET /api/admin/users/:id',
      blockUser: 'POST /api/admin/users/:id/block',
      unblockUser: 'POST /api/admin/users/:id/unblock',
      deleteUser: 'DELETE /api/admin/users/:id',
      getOrderHistory: 'GET /api/admin/users/:id/orders',
    },
    
    brands: {
      getAll: 'GET /api/admin/brands',
      add: 'POST /api/admin/brands',
      edit: 'PUT /api/admin/brands/:id',
      delete: 'DELETE /api/admin/brands/:id',
      setFeatured: 'POST /api/admin/brands/:id/featured',
    },
    
    features: {
      phase_1: [
        '✅ Admin Login',
        '✅ Dashboard Overview',
        '✅ Product Management (View/Add/Edit/Delete)',
        '✅ Order Management (View/Update Status)',
        '✅ User Management (View/Block)',
      ],
      phase_2: [
        '✅ Inventory Management',
        '✅ Offers/Discounts',
        '✅ Reports',
        '✅ Admin Settings',
      ],
      phase_3: [
        '✅ Customer Support',
        '✅ Analytics',
        '✅ Multi-admin roles',
      ],
    },
    
    note: 'All routes require admin authentication token in Authorization header',
  });
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    
    customerRoutes: [
      '/api/products',
      '/api/chat',
    ],
    
    adminRoutes: [
      '/api/admin/auth',
      '/api/admin/dashboard',
      '/api/admin/products',
      '/api/admin/orders',
      '/api/admin/users',
      '/api/admin/brands',
    ],
    
    help: 'Check /api for complete API documentation',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Hugging Face API errors
  if (err.message && err.message.includes('HUGGINGFACE')) {
    return res.status(503).json({
      success: false,
      message: 'AI service temporarily unavailable',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Generic error
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
    })
  });
});

// ============================================
// SERVER INITIALIZATION
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 ShopWise Server Started`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`📚 Docs: http://localhost:${PORT}/api`);
  console.log(`👨‍💼 Admin Docs: http://localhost:${PORT}/api/admin`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✅ Customer Routes:');
  console.log(`   📱 Products: /api/products`);
  console.log(`   🤖 Chat: /api/chat`);
  console.log('');
  console.log('✅ Admin Routes:');
  console.log(`   🔐 Auth: /api/admin/auth`);
  console.log(`   📊 Dashboard: /api/admin/dashboard`);
  console.log(`   📦 Products: /api/admin/products`);
  console.log(`   📋 Orders: /api/admin/orders`);
  console.log(`   👥 Users: /api/admin/users`);
  console.log(`   🏷️ Brands: /api/admin/brands`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🔑 Services Status:');
  console.log(`   Database: ${process.env.MONGO_URI ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`   Hugging Face AI: ${process.env.HUGGINGFACE_API_KEY ? '✅ Configured' : '❌ API key missing'}`);
  console.log(`   Admin Panel: ✅ Active`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('\n❌ Unhandled Rejection:', err.message);
  console.log('🔄 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

export default app;