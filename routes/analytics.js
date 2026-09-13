const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Shop = require('../models/Shop');
const { ensureAuth } = require('../middleware/auth');

// GET analytics for a specific shop (auth required)
router.get('/:shopId', ensureAuth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const shopId = req.params.shopId;

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    // Generate date range
    const dates = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // Get analytics data
    const analyticsData = await Analytics.find({
      shopId,
      date: { $in: dates }
    }).sort({ date: 1 });

    // Build response with all dates
    const result = dates.map(date => {
      const found = analyticsData.find(a => a.date === date);
      return {
        date,
        views: found ? found.views : 0,
        inquiries: found ? found.inquiries : 0
      };
    });

    // Summary
    const totalViews = result.reduce((sum, d) => sum + d.views, 0);
    const totalInquiries = result.reduce((sum, d) => sum + d.inquiries, 0);
    const avgViews = totalViews / result.length;

    res.json({
      daily: result,
      summary: {
        totalViews,
        totalInquiries,
        avgViews: Math.round(avgViews),
        conversionRate: totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : '0.0'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// GET admin analytics overview
router.get('/overview/all', ensureAuth, async (req, res) => {
  try {
    const shops = await Shop.find();
    const totalViews = shops.reduce((sum, s) => sum + (s.views || 0), 0);
    const totalInquiries = shops.reduce((sum, s) => sum + (s.inquiryCount || 0), 0);

    const categoryMap = {};
    shops.forEach(s => { categoryMap[s.category] = (categoryMap[s.category] || 0) + 1; });

    const planMap = {};
    shops.forEach(s => { planMap[s.plan] = (planMap[s.plan] || 0) + 1; });

    res.json({
      totalShops: shops.length,
      activeShops: shops.filter(s => s.status === 'active').length,
      totalViews,
      totalInquiries,
      categoryDistribution: categoryMap,
      planDistribution: planMap
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router;
