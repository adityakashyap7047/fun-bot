const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const discord = require('../utils/discord');
const { sanitizeObject, containsMongoOperator } = require('../utils/sanitize');

const NOTE_FIELDS = ['title', 'content', 'color'];

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Please log in' });
}

// GET all notes (auth required - private data)
router.get('/', ensureAuth, async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load notes' });
  }
});

// POST create note (auth required)
router.post('/', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, NOTE_FIELDS);
    const note = new Note(data);
    await note.save();
    discord.noteCreated(note);
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create note' });
  }
});

// PUT update note (auth required)
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, NOTE_FIELDS);
    const note = await Note.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update note' });
  }
});

// DELETE note (auth required)
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
