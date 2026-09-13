const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');

// GET settings (admin only - do not leak admin username publicly)
router.get('/', ensureAuth, ensureAdmin, async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      return res.status(404).json({ error: 'No settings found' });
    }
    res.json({ username: settings.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update settings (admin only - only allow password change)
router.put('/', ensureAdmin, async (req, res) => {
  try {
    const { password, currentPassword } = req.body;
    if (!password || !currentPassword) {
      return res.status(400).json({ error: 'Both password and currentPassword are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and a number' });
    }

    let settings = await Setting.findOne();
    if (!settings) {
      return res.status(404).json({ error: 'No settings found' });
    }

    const valid = await settings.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    settings.password = password;
    await settings.save();
    res.json({ username: settings.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
