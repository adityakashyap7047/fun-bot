const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const Testimonial = require('../models/Testimonial');
const Inquiry = require('../models/Inquiry');
const Task = require('../models/Task');
const Note = require('../models/Note');
const Event = require('../models/Event');
const Analytics = require('../models/Analytics');
const ReviewReply = require('../models/ReviewReply');
const Setting = require('../models/Setting');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');

// POST /api/admin/reset - Reset all data to defaults (admin only)
router.post('/reset', ensureAuth, ensureAdmin, async (req, res) => {
  try {
    // Preserve admin settings
    const adminSettings = await Setting.findOne();

    // Clear all collections
    await Shop.deleteMany({});
    await Category.deleteMany({});
    await Testimonial.deleteMany({});
    await Inquiry.deleteMany({});
    await Task.deleteMany({});
    await Note.deleteMany({});
    await Event.deleteMany({});
    await Analytics.deleteMany({});
    await ReviewReply.deleteMany({});

    // Re-seed
    const seedData = require('../seed');
    await seedData();

    res.json({ ok: true, message: 'All data reset and re-seeded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset data: ' + err.message });
  }
});

module.exports = router;
