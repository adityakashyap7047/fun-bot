const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  category: { type: String, default: '' },
  address: { type: String, default: '' },
  description: { type: String, default: '' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
