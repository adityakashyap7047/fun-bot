const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  date: { type: String, required: true },
  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 }
}, { timestamps: true });

analyticsSchema.index({ shopId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
