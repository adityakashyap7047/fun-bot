const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const Setting = require('../models/Setting');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, name, shop, category, phone, password } = req.body;
    if (!username || !name || !shop || !category || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and a number' });
    }
    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Username already taken' });

    const user = await User.create({ username, name, shop, category, phone, password });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login after register failed' });
      res.status(201).json({ id: user._id, username: user.username, name: user.name, role: user.role });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: info.message || 'Invalid credentials' });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      res.json({ id: user._id, username: user.username, name: user.name, role: user.role });
    });
  })(req, res, next);
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not logged in' });
  const u = req.user;
  res.json({ id: u._id, username: u.username, name: u.name, role: u.role });
});

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/admin' }), (req, res) => {
  if (req.user.role === 'admin') res.redirect('/admin');
  else res.redirect('/shop');
});

// POST /api/auth/forgot-check — disabled for security
router.post('/forgot-check', (req, res) => {
  res.status(403).json({ error: 'Password reset is only available while logged in. Contact an administrator for assistance.' });
});

// POST /api/auth/reset-password — requires authentication
router.post('/reset-password', async (req, res) => {
  try {
    const { password, currentPassword } = req.body;

    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Please log in to reset your password' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and a number' });
    }

    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required' });
    }

    if (req.user.role === 'admin') {
      const settings = await Setting.findOne();
      const valid = await settings.comparePassword(currentPassword);
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
      settings.password = password;
      await settings.save();
      return res.json({ ok: true });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = password;
    await user.save();
    return res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
