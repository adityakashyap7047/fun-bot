const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const Analytics = require('../models/Analytics');
const discord = require('../utils/discord');
const { sanitizeObject, containsMongoOperator } = require('../utils/sanitize');
const { ensureAuth } = require('../middleware/auth');

const SHOP_FIELDS = ['name', 'owner', 'category', 'phone', 'address', 'description', 'image', 'status', 'plan', 'location', 'branding'];
const SHOP_UPDATE_FIELDS = ['name', 'owner', 'category', 'phone', 'address', 'description', 'image', 'status', 'plan', 'location', 'branding'];

// GET all shops (public) with optional pagination
router.get('/', async (req, res) => {
  try {
    const { page, limit, status, category, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { owner: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (page && limit) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Shop.countDocuments(query);
      const shops = await Shop.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
      return res.json({ shops, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    }

    const shops = await Shop.find(query).sort({ createdAt: -1 });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load shops' });
  }
});

// GET single shop (public) + track view
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    // Track view
    shop.views = (shop.views || 0) + 1;
    await shop.save();

    // Track daily analytics
    const today = new Date().toISOString().split('T')[0];
    try {
      await Analytics.findOneAndUpdate(
        { shopId: shop._id, date: today },
        { $inc: { views: 1 } },
        { upsert: true, new: true }
      );
    } catch (e) { /* analytics tracking is non-critical */ }

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
    if (data.location) {
      data.location = {
        lat: typeof data.location.lat === 'number' ? data.location.lat : null,
        lng: typeof data.location.lng === 'number' ? data.location.lng : null,
        city: typeof data.location.city === 'string' ? data.location.city.trim() : '',
        state: typeof data.location.state === 'string' ? data.location.state.trim() : ''
      };
    }
    if (data.branding) {
      data.branding = {
        primaryColor: typeof data.branding.primaryColor === 'string' ? data.branding.primaryColor : '#4f6ef7',
        accentColor: typeof data.branding.accentColor === 'string' ? data.branding.accentColor : '#22b573',
        bgColor: typeof data.branding.bgColor === 'string' ? data.branding.bgColor : '#ffffff',
        textColor: typeof data.branding.textColor === 'string' ? data.branding.textColor : '#1a1a2e',
        tagline: typeof data.branding.tagline === 'string' ? data.branding.tagline : '',
        logo: typeof data.branding.logo === 'string' ? data.branding.logo : ''
      };
    }
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
    if (data.location) {
      data.location = {
        lat: typeof data.location.lat === 'number' ? data.location.lat : null,
        lng: typeof data.location.lng === 'number' ? data.location.lng : null,
        city: typeof data.location.city === 'string' ? data.location.city.trim() : '',
        state: typeof data.location.state === 'string' ? data.location.state.trim() : ''
      };
    }
    if (data.branding) {
      data.branding = {
        primaryColor: typeof data.branding.primaryColor === 'string' ? data.branding.primaryColor : '#4f6ef7',
        accentColor: typeof data.branding.accentColor === 'string' ? data.branding.accentColor : '#22b573',
        bgColor: typeof data.branding.bgColor === 'string' ? data.branding.bgColor : '#ffffff',
        textColor: typeof data.branding.textColor === 'string' ? data.branding.textColor : '#1a1a2e',
        tagline: typeof data.branding.tagline === 'string' ? data.branding.tagline : '',
        logo: typeof data.branding.logo === 'string' ? data.branding.logo : ''
      };
    }
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
