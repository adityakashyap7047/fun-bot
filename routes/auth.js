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
    res.json({ ok: true });
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

// POST /api/auth/forgot-check
router.post('/forgot-check', async (req, res) => {
  try {
    const { username } = req.body;
    const settings = await Setting.findOne();
    if (settings && username === settings.username) return res.json({ found: true });
    const user = await User.findOne({ username: username.toLowerCase() });
    if (user) return res.json({ found: true });
    res.status(404).json({ error: 'No account found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!password || password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

    // If logged in, reset own password
    if (req.isAuthenticated()) {
      if (req.user.role === 'admin') {
        const settings = await Setting.findOne();
        settings.password = password;
        await settings.save();
        return res.json({ ok: true });
      }
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.password = password;
      await user.save();
      return res.json({ ok: true });
    }

    // Forgot password flow — username required in body
    if (!username) return res.status(400).json({ error: 'Username required' });

    // Reset admin password
    const settings = await Setting.findOne();
    if (settings && username === settings.username) {
      settings.password = password;
      await settings.save();
      return res.json({ ok: true });
    }

    // Reset user password
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = password;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
