const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const Shop = require('../models/Shop');
const discord = require('../utils/discord');
const { sanitizeObject, containsMongoOperator } = require('../utils/sanitize');
const { ensureAuth } = require('../middleware/auth');

const INQUIRY_FIELDS = ['shopName', 'ownerName', 'phone', 'category', 'address', 'description'];

// GET all inquiries (auth required - private data)
router.get('/', ensureAuth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load inquiries' });
  }
});

// POST create inquiry (PUBLIC - no auth required for contact form)
router.post('/', async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, INQUIRY_FIELDS);
    if (!data.shopName || !data.ownerName || !data.phone) {
      return res.status(400).json({ error: 'Name, owner, and phone are required' });
    }
    const inquiry = new Inquiry(data);
    await inquiry.save();

    // Track inquiry count on the shop if it exists
    if (data.shopName && data.shopName !== 'Newsletter') {
      const shop = await Shop.findOne({ name: data.shopName });
      if (shop) {
        shop.inquiryCount = (shop.inquiryCount || 0) + 1;
        await shop.save();
      }
    }

    discord.inquiryCreated(inquiry);
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create inquiry' });
  }
});

// PUT mark inquiry as read (auth required)
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    res.json(inquiry);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update inquiry' });
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
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

module.exports = router;
