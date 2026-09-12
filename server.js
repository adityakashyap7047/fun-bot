require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const passport = require('passport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/shoplocal',
    ttl: 24 * 60 * 60,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require('./config/passport')(passport);

app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection + Seed
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shoplocal')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    const seedData = require('./seed');
    await seedData();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Auth middleware
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Please log in' });
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Admin access required' });
}

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/events', require('./routes/events'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/upload', require('./routes/upload'));

// Make auth middleware available to routes
app.locals.ensureAuth = ensureAuth;
app.locals.ensureAdmin = ensureAdmin;

// Serve frontend - specific routes only
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
