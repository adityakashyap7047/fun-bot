const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const discord = require('../utils/discord');
const { sanitizeObject, containsMongoOperator } = require('../utils/sanitize');

const SHOP_FIELDS = ['name', 'owner', 'category', 'phone', 'address', 'description', 'image', 'status', 'plan'];
const SHOP_UPDATE_FIELDS = ['name', 'owner', 'category', 'phone', 'address', 'description', 'image', 'status', 'plan'];

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Please log in' });
}

// GET all shops (public)
router.get('/', async (req, res) => {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load shops' });
  }
});

// GET single shop (public)
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load shop' });
  }
});

// POST create shop (auth required)
router.post('/', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, SHOP_FIELDS);
    const shop = new Shop(data);
    await shop.save();
    discord.shopCreated(shop);
    res.status(201).json(shop);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create shop' });
  }
});

// PUT update shop (auth required)
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    if (containsMongoOperator(req.body)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const data = sanitizeObject(req.body, SHOP_UPDATE_FIELDS);
    const oldShop = await Shop.findById(req.params.id);
    const shop = await Shop.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    if (oldShop && oldShop.status !== shop.status) {
      discord.shopStatusChanged(shop, oldShop.status);
    } else {
      discord.shopUpdated(shop);
    }
    res.json(shop);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update shop' });
  }
});

// DELETE shop (auth required)
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    discord.shopDeleted(shop.name);
    res.json({ message: 'Shop deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete shop' });
  }
});

module.exports = router;
