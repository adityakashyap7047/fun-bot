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
  plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    city: { type: String, default: '' },
    state: { type: String, default: '' }
  },
  branding: {
    primaryColor: { type: String, default: '#4f6ef7' },
    accentColor: { type: String, default: '#22b573' },
    bgColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#1a1a2e' },
    tagline: { type: String, default: '' },
    logo: { type: String, default: '' }
  },
  views: { type: Number, default: 0 },
  inquiryCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
