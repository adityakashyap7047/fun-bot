require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const passport = require('passport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

app.set('trust proxy', 1);

// Security headers with CSP enabled
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://accounts.google.com", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://maps.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      connectSrc: ["'self'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      frameSrc: ["https://accounts.google.com", "https://www.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false
}));

// NoSQL injection protection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key "${key}" from request`);
  }
}));

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// CORS - restrict to known origins
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  'https://vyaparhub.store'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/vyaparhub',
    ttl: 24 * 60 * 60,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require('./config/passport')(passport);

// Serve only specific static files (not entire project root)
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve specific HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop.html'));
});
app.get('/shop.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop.html'));
});
app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'map.html'));
});
app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname, 'pricing.html'));
});
// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/shops', globalLimiter, require('./routes/shops'));
app.use('/api/categories', globalLimiter, require('./routes/categories'));
app.use('/api/testimonials', globalLimiter, require('./routes/testimonials'));
app.use('/api/inquiries', globalLimiter, require('./routes/inquiries'));
app.use('/api/tasks', globalLimiter, require('./routes/tasks'));
app.use('/api/notes', globalLimiter, require('./routes/notes'));
app.use('/api/events', globalLimiter, require('./routes/events'));
app.use('/api/settings', globalLimiter, require('./routes/settings'));
app.use('/api/announcements', globalLimiter, require('./routes/announcements'));
app.use('/api/upload', globalLimiter, require('./routes/upload'));
app.use('/api/analytics', globalLimiter, require('./routes/analytics'));
app.use('/api/admin', globalLimiter, require('./routes/admin'));

// Daily summary scheduler
const discord = require('./utils/discord');
const Shop = require('./models/Shop');
const Inquiry = require('./models/Inquiry');
const Testimonial = require('./models/Testimonial');
const Task = require('./models/Task');

function scheduleDailySummary() {
  const now = new Date();
  const target = new Date();
  target.setHours(9, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const delay = target.getTime() - now.getTime();

  setTimeout(async () => {
    try {
      const shops = await Shop.find();
      const today = new Date().toISOString().split('T')[0];
      const todayInquiries = await Inquiry.countDocuments({ createdAt: { $gte: new Date(today) } });
      const totalReviews = await Testimonial.countDocuments();
      const openTasks = await Task.countDocuments({ done: false });

      await discord.dailySummary({
        totalShops: shops.length,
        activeShops: shops.filter(s => s.status === 'active').length,
        newInquiries: todayInquiries,
        totalReviews,
        openTasks
      });
      console.log('📊 Daily summary sent');
    } catch (err) {
      console.error('Daily summary error:', err.message);
    }
    scheduleDailySummary();
  }, delay);
}

// Connect to DB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vyaparhub')
  .then(async () => {
    console.log('Connected to MongoDB');
    const seedData = require('./seed');
    await seedData();
    scheduleDailySummary();
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
