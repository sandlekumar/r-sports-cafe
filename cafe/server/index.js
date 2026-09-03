require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/r-sports-cafe';

// ─── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allowed for cross-origin assets/video playback
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ─── Rate Limiting (Brute-Force & DoS Protection) ────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' },
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_LOGIN_ATTEMPTS', message: 'Too many login attempts. Please try again after 15 minutes.' },
  },
});

app.use('/api/', apiLimiter);
app.use('/api/admin/login', authLimiter);

// ─── Middleware & Request Limits ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true, // Required for HttpOnly cookie exchange
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files (event photos, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const seedData = require('./utils/seedData');

// ─── Database ──────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    // Register all models after DB is ready
    require('./models/index');
    // Seed default areas, tables, business hours, settings if DB is empty
    await seedData();
  })
  .catch(err => console.error('❌ MongoDB Error:', err));

// ─── Routes ───────────────────────────────────────────────────────────────────
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// ─── Global Error Handler (must be last) ──────────────────────────────────────
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
