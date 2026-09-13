const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const discord = require('../utils/discord');
const { sanitizeObject, containsMongoOperator } = require('../utils/sanitize');
const { ensureAuth } = require('../middleware/auth');

const CATEGORY_FIELDS = ['name', 'icon'];

// GET all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// POST create category (auth required)
router.post('/', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, CATEGORY_FIELDS);
    const category = new Category(data);
    await category.save();
    discord.categoryCreated(category);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create category' });
  }
});

// PUT update category (auth required)
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, CATEGORY_FIELDS);
    const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update category' });
  }
});

// DELETE category (auth required)
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
