const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const discord = require('../utils/discord');

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Please log in' });
}

// GET all inquiries (auth required - private data)
router.get('/', ensureAuth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create inquiry (auth required)
router.post('/', ensureAuth, async (req, res) => {
  try {
    const inquiry = new Inquiry(req.body);
    await inquiry.save();
    discord.inquiryCreated(inquiry);
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE inquiry (auth required)
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    discord.inquiryDeleted();
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
