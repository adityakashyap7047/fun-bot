const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Please log in' });
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Admin access required' });
}

// GET settings (public - needed for login page to identify admin)
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({ username: 'admin', password: 'admin123' });
      await settings.save();
    }
    res.json({ username: settings.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update settings (admin only)
router.put('/', ensureAdmin, async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ username: settings.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
