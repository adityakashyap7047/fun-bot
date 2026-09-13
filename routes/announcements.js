const express = require('express');
const router = express.Router();
const discord = require('../utils/discord');

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Please log in' });
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Admin access required' });
}

// POST /api/announcements - Send announcement to ALL channels (admin only)
router.post('/', ensureAdmin, async (req, res) => {
  try {
    const { title, message, color } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const colorMap = {
      green: discord.COLORS.green,
      blue: discord.COLORS.blue,
      orange: discord.COLORS.orange,
      red: discord.COLORS.red,
      pink: discord.COLORS.pink,
      teal: discord.COLORS.teal,
      purple: discord.COLORS.purple
    };

    await discord.sendAnnouncement(title, message, colorMap[color] || discord.COLORS.purple);
    res.json({ success: true, message: 'Announcement sent to all channels' });
  } catch (err) {
    console.error('Announcement error:', err);
    res.status(500).json({ error: 'Failed to send announcement' });
  }
});

// POST /api/announcements/test - Test bot connectivity (admin only)
router.post('/test', ensureAdmin, async (req, res) => {
  try {
    await discord.testNotification();
    res.json({ success: true, message: 'Test notification sent to bot-tester-feed' });
  } catch (err) {
    res.status(500).json({ error: 'Test failed' });
  }
});

// GET /api/announcements/channels - List configured channels (admin only)
router.get('/channels', ensureAdmin, (req, res) => {
  const channels = Object.entries(discord.WEBHOOKS).map(([key, url]) => ({
    name: key,
    configured: !!(url && !url.includes('YOUR_WEBHOOK'))
  }));
  res.json(channels);
});

module.exports = router;
