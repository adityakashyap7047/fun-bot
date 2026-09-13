const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const discord = require('../utils/discord');
const { sanitizeObject, containsMongoOperator } = require('../utils/sanitize');
const { ensureAuth } = require('../middleware/auth');

const EVENT_FIELDS = ['title', 'time', 'type', 'date'];

// GET all events (auth required - private data)
router.get('/', ensureAuth, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// POST create event (auth required)
router.post('/', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, EVENT_FIELDS);
    const event = new Event(data);
    await event.save();
    discord.eventCreated(event);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create event' });
  }
});

// PUT update event (auth required)
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, EVENT_FIELDS);
    const event = await Event.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update event' });
  }
});

// DELETE event (auth required)
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
