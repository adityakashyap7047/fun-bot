const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const ReviewReply = require('../models/ReviewReply');
const discord = require('../utils/discord');
const { sanitizeObject, containsMongoOperator } = require('../utils/sanitize');
const { ensureAuth } = require('../middleware/auth');

const TESTIMONIAL_FIELDS = ['name', 'shop', 'rating', 'review'];

// GET all testimonials (public)
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load testimonials' });
  }
});

// GET replies for a testimonial
router.get('/:id/replies', async (req, res) => {
  try {
    const replies = await ReviewReply.find({ testimonialId: req.params.id }).sort({ createdAt: 1 });
    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load replies' });
  }
});

// POST create testimonial (auth required)
router.post('/', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, TESTIMONIAL_FIELDS);
    if (data.rating) data.rating = Math.min(5, Math.max(1, parseInt(data.rating) || 3));
    const testimonial = new Testimonial(data);
    await testimonial.save();
    discord.testimonialCreated(testimonial);
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create testimonial' });
  }
});

// POST reply to a testimonial (auth required)
router.post('/:id/reply', ensureAuth, async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });

    const reviewReply = new ReviewReply({
      testimonialId: req.params.id,
      reply: reply.trim(),
      repliedBy: req.user.name || req.user.username
    });
    await reviewReply.save();
    res.status(201).json(reviewReply);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create reply' });
  }
});

// PUT update testimonial (auth required)
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, TESTIMONIAL_FIELDS);
    if (data.rating) data.rating = Math.min(5, Math.max(1, parseInt(data.rating) || 3));
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
    res.json(testimonial);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update testimonial' });
  }
});

// DELETE testimonial (auth required)
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
    await ReviewReply.deleteMany({ testimonialId: req.params.id });
    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

module.exports = router;
