require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./src/config/database');
const User = require('./src/models/User');

// Import Route Handlers
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const purchaseRoutes = require('./src/routes/purchaseRoutes');
const saleRoutes = require('./src/routes/saleRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure public uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {}
}

// Ensure MongoDB Atlas Connection & Admin User Auto-Bootstrap
let isDbConnected = false;
const ensureDbConnection = async (req, res, next) => {
  try {
    if (!isDbConnected) {
      await connectDB();
      isDbConnected = true;
      // Auto-bootstrap default admin user
      const adminExists = await User.findOne({ email: 'admin@erp.com' });
      if (!adminExists) {
        await User.create({
          name: 'Administrator User',
          email: 'admin@erp.com',
          password: 'Admin@123',
          role: 'Administrator',
          phone: '+91 99999 11111'
        });
        console.log('[Auto-Bootstrap]: Default Admin (admin@erp.com / Admin@123) created successfully.');
      }
    }
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err.message);
    res.status(500).json({ success: false, message: 'Database connection failed. ' + err.message });
  }
};

// Apply DB Middleware
app.use(ensureDbConnection);

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(mongoSanitize());

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

// CORS Config
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Uploads
app.use('/uploads', express.static(uploadsDir));

// Mount API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'Inventory & Billing Management ERP API',
    timestamp: new Date()
  });
});

// Serve Frontend Static Dist if present
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Backend Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Express Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Inventory & Billing Backend Active]: http://localhost:${PORT}`);
  });
}

// Export Express App for Vercel Serverless Function compatibility
module.exports = app;
