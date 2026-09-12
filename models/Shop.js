const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  category: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'active' },
  plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
